import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { theme } from '../theme/tokens';
import type { Product, ProductCategory, RankedProduct, WhenToUse } from '../types/product';
import { ProductSearchController, type ControllerState } from '../search/productSearchController';

const CATEGORIES: ProductCategory[] = ['Cleanse', 'Treat', 'Seal', 'Finish', 'Protect'];
const WHEN_OPTIONS: WhenToUse[] = ['Morning', 'Evening', 'Both'];

/** Minimum comfortable touch target. */
const TOUCH_TARGET = 44;

export interface AddProductToCabinetScreenProps {
  onBackToCabinet?: () => void;
  onAddProduct?: (payload: {
    brand: string;
    productName: string;
    productId: string | null;
    categories: ProductCategory[];
    whenToUse: WhenToUse[];
    userEntered: boolean;
  }) => void;
  /** Injectable for tests and previews */
  controller?: ProductSearchController;
}

/** Honest, non-medical label for what Dewy knows about a record. */
function provenanceLabel(product: Product): string {
  if (product.provenance === 'user_entered') return 'Added By You · Not Verified';
  if (product.provenance === 'fixture') return 'Sample Catalog · Not Verified';
  if (product.verificationStatus === 'manufacturer_verified') return 'Manufacturer Verified';
  if (product.providerName) return `From ${product.providerName} · Not Verified`;
  return 'Not Verified';
}

function ingredientLabel(product: Product): string {
  switch (product.ingredientStatus) {
    case 'complete':
      return 'Ingredients Available';
    case 'partial':
      return 'Ingredients Partially Available';
    case 'unverified':
      return 'Ingredients Unverified';
    case 'unavailable':
    default:
      // Never implies the product has no ingredients.
      return 'Ingredients Not Available Yet';
  }
}

function ResultThumbnail({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.thumb}
        accessibilityIgnoresInvertColors
        // Decorative: the row already announces brand and name.
        accessible={false}
      />
    );
  }
  const initial = product.brand.trim().charAt(0).toUpperCase() || '·';
  return (
    <View style={[styles.thumb, styles.thumbPlaceholder]} accessible={false}>
      <Text style={styles.thumbInitial}>{initial}</Text>
    </View>
  );
}

function ResultRow({
  entry,
  isActive,
  onPress,
}: {
  entry: RankedProduct;
  isActive: boolean;
  onPress: () => void;
}) {
  const { product } = entry;
  const details = [product.typeLabel, product.sizeLabel].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={[styles.resultRow, isActive && styles.resultRowActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${product.brand} ${product.name}. ${details}. ${ingredientLabel(
        product,
      )}. ${provenanceLabel(product)}.`}
      accessibilityHint="Adds this product's details to the form"
    >
      <ResultThumbnail product={product} />
      <View style={styles.resultBody}>
        <Text style={styles.resultBrand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.resultName} numberOfLines={2}>
          {product.name}
        </Text>
        {details ? (
          <Text style={styles.resultDetail} numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{ingredientLabel(product)}</Text>
          <Text style={styles.badgeQuiet}>{provenanceLabel(product)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function AddProductToCabinetScreen({
  onBackToCabinet,
  onAddProduct,
  controller: injectedController,
}: AddProductToCabinetScreenProps) {
  const controller = useMemo(
    () => injectedController ?? new ProductSearchController(),
    [injectedController],
  );
  const [state, setState] = useState<ControllerState>(() => controller.getState());
  const { width } = useWindowDimensions();
  const isWide = width >= 700;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(controller.getState());
    return controller.subscribe(setState);
  }, [controller]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  /** Debounce typing so we do not search on every keystroke. */
  const onChangeQuery = useCallback(
    (text: string) => {
      // Reflect the keystroke immediately; search shortly after.
      setState((prev) => ({ ...prev, query: text }));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void controller.setQuery(text);
      }, 180);
    },
    [controller],
  );

  const onKeyPress = useCallback(
    (event: { nativeEvent: { key: string } }) => {
      controller.handleKey(event.nativeEvent.key);
    },
    [controller],
  );

  const handleAdd = useCallback(() => {
    const { form } = controller.getState();
    onAddProduct?.({
      brand: form.brand.trim(),
      productName: form.productName.trim(),
      productId: form.productId,
      categories: form.categories,
      whenToUse: form.whenToUse,
      userEntered: form.userEntered,
    });
  }, [controller, onAddProduct]);

  const { form, status, results, suggestions, selected, routineSuggestion } = state;
  const showPanel = state.isOpen && !selected;
  const showForm = selected !== null || state.manualMode || form.productName.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.scroll, isWide && styles.scrollWide]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={onBackToCabinet}
          accessibilityRole="link"
          accessibilityLabel="Back To Cabinet"
          hitSlop={8}
        >
          <Text style={styles.backLink}>Back To Cabinet</Text>
        </Pressable>

        <Text style={styles.title}>Add Product To Cabinet</Text>
        <Text style={styles.subtitle}>
          Search by brand, product, or what it does. Spelling does not need to be perfect.
        </Text>

        {/* ─── Search ─────────────────────────────────────────────── */}
        <Text style={styles.label} nativeID="dewy-search-label">
          Find Your Product
        </Text>
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.field}
            value={state.query}
            onChangeText={onChangeQuery}
            onKeyPress={onKeyPress}
            onFocus={() => controller.open()}
            placeholder="Try “Dior Moisturizer” Or “Lash Serum”"
            placeholderTextColor={theme.colors.softSilver}
            accessibilityLabel="Find Your Product"
            accessibilityHint="Results appear below as you type. Use the up and down arrows to review them."
            accessibilityLabelledBy="dewy-search-label"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {state.query.length > 0 ? (
            <Pressable
              onPress={() => controller.clearSelection()}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear Search"
              hitSlop={12}
            >
              <Text style={styles.clearGlyph}>×</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Status announcements for screen readers */}
        <View accessibilityLiveRegion="polite" style={styles.srStatus}>
          {status === 'loading' ? <Text style={styles.statusText}>Searching…</Text> : null}
          {status === 'results' ? (
            <Text style={styles.statusText}>
              {results.length} {results.length === 1 ? 'Match' : 'Matches'}
            </Text>
          ) : null}
        </View>

        {/* ─── Results panel ──────────────────────────────────────── */}
        {showPanel && status === 'loading' ? (
          <View style={styles.panel}>
            <View style={styles.centerRow}>
              <ActivityIndicator color={theme.colors.driedPlum} />
              <Text style={styles.quietNote}>Looking Through The Catalog…</Text>
            </View>
          </View>
        ) : null}

        {showPanel && status === 'results' ? (
          <View style={styles.panel} accessibilityRole="list">
            {results.map((entry, index) => (
              <ResultRow
                key={entry.product.id}
                entry={entry}
                isActive={index === state.highlightIndex}
                onPress={() => controller.selectProduct(entry.product)}
              />
            ))}
          </View>
        ) : null}

        {showPanel && status === 'no_results' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>No Matches Yet</Text>
            <Text style={styles.quietNote}>
              Dewy could not find that in the catalog. That does not mean it does not exist.
            </Text>
            {suggestions.length > 0 ? (
              <View style={styles.suggestionRow}>
                <Text style={styles.quietNote}>Try:</Text>
                {suggestions.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => void controller.useSuggestion(s)}
                    style={styles.chip}
                    accessibilityRole="button"
                    accessibilityLabel={`Search For ${s}`}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            <Pressable
              onPress={() => controller.enterManualMode()}
              style={styles.secondaryButton}
              accessibilityRole="button"
              accessibilityLabel="Add This Product Manually"
            >
              <Text style={styles.secondaryButtonText}>Add This Product Manually</Text>
            </Pressable>
          </View>
        ) : null}

        {showPanel && status === 'error' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Search Is Unavailable</Text>
            <Text style={styles.quietNote}>
              {state.error ?? 'Something went wrong.'} You can try again or add the product
              yourself.
            </Text>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => void controller.retry()}
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel="Try Again"
              >
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </Pressable>
              <Pressable
                onPress={() => controller.enterManualMode()}
                style={styles.secondaryButton}
                accessibilityRole="button"
                accessibilityLabel="Add This Product Manually"
              >
                <Text style={styles.secondaryButtonText}>Add Manually</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ─── Selected product summary ───────────────────────────── */}
        {selected ? (
          <View style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <Text style={styles.selectedLabel}>Selected</Text>
              <Pressable
                onPress={() => controller.clearSelection()}
                accessibilityRole="button"
                accessibilityLabel="Change Product"
                hitSlop={8}
              >
                <Text style={styles.changeLink}>Change</Text>
              </Pressable>
            </View>
            <Text style={styles.selectedName}>
              {selected.brand} · {selected.name}
            </Text>
            <Text style={styles.badge}>{ingredientLabel(selected)}</Text>
            <Text style={styles.badgeQuiet}>{provenanceLabel(selected)}</Text>
          </View>
        ) : null}

        {state.manualMode ? (
          <View style={styles.selectedCard}>
            <Text style={styles.selectedLabel}>Added By You</Text>
            <Text style={styles.quietNote}>
              This product will be saved as user-entered and unverified. You can add details
              later.
            </Text>
          </View>
        ) : null}

        {/* ─── Editable form ──────────────────────────────────────── */}
        {showForm ? (
          <>
            <Text style={[styles.label, styles.sectionLabel]}>Brand</Text>
            <TextInput
              style={styles.field}
              value={form.brand}
              onChangeText={(t) => controller.setBrand(t)}
              placeholder="Optional"
              placeholderTextColor={theme.colors.softSilver}
              accessibilityLabel="Brand"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.field}
              value={form.productName}
              onChangeText={(t) => controller.setProductName(t)}
              accessibilityLabel="Product Name"
              autoCapitalize="words"
            />

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.label, styles.sectionLabel]}>Category</Text>
              {routineSuggestion?.category && !state.suggestionEdited ? (
                <Text style={styles.suggestedTag}>Suggested</Text>
              ) : null}
            </View>
            {routineSuggestion?.rationale && !state.suggestionEdited ? (
              <Text style={styles.rationale}>
                {routineSuggestion.rationale} You can change it.
              </Text>
            ) : null}
            {routineSuggestion?.needsConfirmation && !state.suggestionEdited ? (
              <Text style={styles.confirmNote}>Please confirm this one.</Text>
            ) : null}

            {CATEGORIES.map((c, index) => (
              <Pressable
                key={c}
                style={[styles.row, index < CATEGORIES.length - 1 && styles.rowBorder]}
                onPress={() => controller.toggleCategory(c)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: form.categories.includes(c) }}
                accessibilityLabel={c}
              >
                <Text style={styles.rowText}>{c}</Text>
                <View
                  style={[styles.checkbox, form.categories.includes(c) && styles.checkboxChecked]}
                />
              </Pressable>
            ))}

            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.label, styles.sectionLabel]}>When To Use</Text>
              {routineSuggestion?.whenToUse && !state.suggestionEdited ? (
                <Text style={styles.suggestedTag}>Suggested</Text>
              ) : null}
            </View>
            {WHEN_OPTIONS.map((w, index) => (
              <Pressable
                key={w}
                style={[styles.row, index < WHEN_OPTIONS.length - 1 && styles.rowBorder]}
                onPress={() => controller.toggleWhenToUse(w)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: form.whenToUse.includes(w) }}
                accessibilityLabel={w}
              >
                <Text style={styles.rowText}>{w}</Text>
                <View
                  style={[styles.checkbox, form.whenToUse.includes(w) && styles.checkboxChecked]}
                />
              </Pressable>
            ))}

            <Pressable
              style={[styles.cta, !controller.canSubmit() && styles.ctaDisabled]}
              onPress={handleAdd}
              disabled={!controller.canSubmit()}
              accessibilityRole="button"
              accessibilityState={{ disabled: !controller.canSubmit() }}
              accessibilityLabel="Add Product To Cabinet"
            >
              <Text style={styles.ctaText}>Add Product To Cabinet</Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Dewy helps you organize cosmetic routines. It does not diagnose or treat any
              condition, and it is not a substitute for a dermatologist.
            </Text>
          </>
        ) : (
          <Pressable
            onPress={() => controller.enterManualMode(false)}
            style={styles.ghostButton}
            accessibilityRole="button"
            accessibilityLabel="Add A Product Manually"
          >
            <Text style={styles.ghostButtonText}>Add A Product Manually</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.screen.background },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  scrollWide: { maxWidth: 640, width: '100%', alignSelf: 'center' },
  backLink: {
    color: theme.screen.ink,
    fontSize: theme.typography.link.fontSize,
    textDecorationLine: 'underline',
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.screen.ink,
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.screen.ink,
    opacity: 0.75,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.screen.ink,
    fontSize: theme.typography.label.fontSize,
    fontWeight: theme.typography.label.fontWeight,
    letterSpacing: theme.typography.label.letterSpacing,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionLabel: { marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  searchWrap: { justifyContent: 'center' },
  field: {
    borderWidth: 1,
    borderColor: theme.screen.border,
    backgroundColor: theme.screen.fieldBackground,
    color: theme.screen.ink,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.sm,
    minHeight: TOUCH_TARGET,
    borderRadius: theme.radii.sm,
  },
  clearButton: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: 0,
    bottom: theme.spacing.sm,
    width: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearGlyph: { color: theme.screen.ink, fontSize: 22, lineHeight: 24 },
  srStatus: { minHeight: 0 },
  statusText: { color: theme.screen.ink, opacity: 0.7, fontSize: 13 },
  panel: {
    borderWidth: 1,
    borderColor: theme.colors.softSilver,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  panelTitle: {
    color: theme.screen.ink,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    minHeight: TOUCH_TARGET + 16,
  },
  resultRowActive: { backgroundColor: theme.colors.buttermilk },
  thumb: { width: 44, height: 44, borderRadius: theme.radii.md },
  thumbPlaceholder: {
    backgroundColor: theme.colors.milkshakePink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInitial: { color: theme.screen.ink, fontSize: 18, fontWeight: '600' },
  resultBody: { flex: 1 },
  resultBrand: {
    color: theme.screen.ink,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  resultName: { color: theme.screen.ink, fontSize: 16, marginTop: 1 },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  resultDetail: { color: theme.screen.ink, opacity: 0.6, fontSize: 13, marginTop: 2 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: 6 },
  badge: { color: theme.screen.ink, opacity: 0.85, fontSize: 12 },
  badgeQuiet: { color: theme.screen.ink, opacity: 0.55, fontSize: 12 },
  quietNote: {
    color: theme.screen.ink,
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.screen.ink,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs + 2,
  },
  chipText: { color: theme.screen.ink, fontSize: 13 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.screen.ink,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 2,
    margin: theme.spacing.md,
    marginTop: 0,
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
  },
  secondaryButtonText: { color: theme.screen.ink, fontSize: 14, fontWeight: '500' },
  ghostButton: {
    borderWidth: 1,
    borderColor: theme.colors.softSilver,
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
  },
  ghostButtonText: { color: theme.screen.ink, fontSize: 15 },
  selectedCard: {
    backgroundColor: theme.colors.milkshakePink,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  selectedLabel: {
    color: theme.screen.ink,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  changeLink: {
    color: theme.screen.ink,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  selectedName: {
    color: theme.screen.ink,
    fontSize: 17,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  suggestedTag: {
    color: theme.screen.ink,
    opacity: 0.7,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: theme.spacing.lg,
  },
  rationale: {
    color: theme.screen.ink,
    opacity: 0.7,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: theme.spacing.sm,
  },
  confirmNote: {
    color: theme.colors.cherryLicorice,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    minHeight: TOUCH_TARGET,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.softSilver,
  },
  rowText: { color: theme.screen.ink, fontSize: theme.typography.body.fontSize },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: theme.screen.ink,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.cherryLicorice,
    borderColor: theme.colors.cherryLicorice,
  },
  cta: {
    marginTop: theme.spacing.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.cherryLicorice,
    backgroundColor: theme.colors.porcelainIvory,
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET,
  },
  ctaDisabled: { opacity: 0.45 },
  ctaText: {
    color: theme.colors.cherryLicorice,
    fontSize: theme.typography.cta.fontSize,
    fontWeight: theme.typography.cta.fontWeight,
    letterSpacing: theme.typography.cta.letterSpacing,
  },
  disclaimer: {
    color: theme.screen.ink,
    opacity: 0.6,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.spacing.lg,
  },
});

export default AddProductToCabinetScreen;

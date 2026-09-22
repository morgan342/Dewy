import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { theme } from '../theme/tokens';
import type { ProductCategory, WhenToUse } from '../types/product';
import { searchProducts } from '../search/searchProducts';

const CATEGORIES: ProductCategory[] = ['Cleanse', 'Treat', 'Seal', 'Finish', 'Protect'];
const WHEN_OPTIONS: WhenToUse[] = ['Morning', 'Evening', 'Both'];

export interface AddProductToCabinetScreenProps {
  onBackToCabinet?: () => void;
  onAddProduct?: (payload: {
    brand: string;
    productName: string;
    categories: ProductCategory[];
    whenToUse: WhenToUse[];
  }) => void;
}

/**
 * Add Product to Cabinet — soft feminine elevated UI.
 * Porcelain Ivory surface, Dried Plum ink, Cherry Licorice CTA.
 * Title Case labels; Cabinet always capitalized.
 */
export function AddProductToCabinetScreen({
  onBackToCabinet,
  onAddProduct,
}: AddProductToCabinetScreenProps) {
  const [brand, setBrand] = useState('');
  const [productName, setProductName] = useState('');
  const [categories, setCategories] = useState<Set<ProductCategory>>(new Set());
  const [whenToUse, setWhenToUse] = useState<Set<WhenToUse>>(new Set());

  const searchHint = useMemo(() => {
    const q = `${brand} ${productName}`.trim();
    if (!q) return null;
    const { results } = searchProducts(q, { limit: 3 });
    return results;
  }, [brand, productName]);

  const toggleCategory = (c: ProductCategory) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  const toggleWhen = (w: WhenToUse) => {
    setWhenToUse((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  };

  const handleAdd = () => {
    onAddProduct?.({
      brand: brand.trim(),
      productName: productName.trim(),
      categories: Array.from(categories),
      whenToUse: Array.from(whenToUse),
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={onBackToCabinet}
          accessibilityRole="link"
          accessibilityLabel="Back to Cabinet"
        >
          <Text style={styles.backLink}>Back to Cabinet</Text>
        </Pressable>

        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.field}
          value={brand}
          onChangeText={setBrand}
          placeholderTextColor={theme.colors.softSilver}
          accessibilityLabel="Brand"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.field}
          value={productName}
          onChangeText={setProductName}
          placeholderTextColor={theme.colors.softSilver}
          accessibilityLabel="Product Name"
          autoCapitalize="words"
        />

        {searchHint && searchHint.length > 0 ? (
          <View style={styles.hintBox} accessibilityLiveRegion="polite">
            <Text style={styles.hintTitle}>Quiet Matches</Text>
            {searchHint.map((r) => (
              <Pressable
                key={r.product.id}
                onPress={() => {
                  setBrand(r.product.brand);
                  setProductName(r.product.name);
                }}
              >
                <Text style={styles.hintRow}>
                  {r.product.brand} · {r.product.name}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.label, styles.sectionLabel]}>Category</Text>
        {CATEGORIES.map((c, index) => (
          <Pressable
            key={c}
            style={[styles.row, index < CATEGORIES.length - 1 && styles.rowBorder]}
            onPress={() => toggleCategory(c)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: categories.has(c) }}
            accessibilityLabel={c}
          >
            <Text style={styles.rowText}>{c}</Text>
            <View style={[styles.checkbox, categories.has(c) && styles.checkboxChecked]} />
          </Pressable>
        ))}

        <Text style={[styles.label, styles.sectionLabel]}>When to Use</Text>
        {WHEN_OPTIONS.map((w, index) => (
          <Pressable
            key={w}
            style={[styles.row, index < WHEN_OPTIONS.length - 1 && styles.rowBorder]}
            onPress={() => toggleWhen(w)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: whenToUse.has(w) }}
            accessibilityLabel={w}
          >
            <Text style={styles.rowText}>{w}</Text>
            <View style={[styles.checkbox, whenToUse.has(w) && styles.checkboxChecked]} />
          </Pressable>
        ))}

        <Pressable
          style={styles.cta}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel="Add Product to Cabinet"
        >
          <Text style={styles.ctaText}>Add Product to Cabinet</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.screen.background,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  backLink: {
    color: theme.screen.ink,
    fontSize: theme.typography.link.fontSize,
    textDecorationLine: 'underline',
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
  sectionLabel: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  field: {
    borderWidth: 1,
    borderColor: theme.screen.border,
    backgroundColor: theme.screen.fieldBackground,
    color: theme.screen.ink,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.sm,
  },
  hintBox: {
    backgroundColor: theme.colors.buttermilk,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  hintTitle: {
    color: theme.screen.ink,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  hintRow: {
    color: theme.screen.ink,
    fontSize: 14,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.softSilver,
  },
  rowText: {
    color: theme.screen.ink,
    fontSize: theme.typography.body.fontSize,
  },
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
  },
  ctaText: {
    color: theme.colors.cherryLicorice,
    fontSize: theme.typography.cta.fontSize,
    fontWeight: theme.typography.cta.fontWeight,
    letterSpacing: theme.typography.cta.letterSpacing,
  },
});

export default AddProductToCabinetScreen;

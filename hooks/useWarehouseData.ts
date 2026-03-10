import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Supplier, Product, StockEntry, StockExit, Tool, ToolCheckout } from '../types';
import { formatDateForInput, parseLocalDate } from '../utils/format';
import { calculateAverageValue } from '../utils/calculations';

export const useWarehouseData = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [exits, setExits] = useState<StockExit[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolCheckouts, setToolCheckouts] = useState<ToolCheckout[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingExits, setLoadingExits] = useState(true);
  const [loadingTools, setLoadingTools] = useState(true);
  const [loadingCheckouts, setLoadingCheckouts] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('description', { ascending: true });

      if (error) throw error;

      if (data) {
        const parsedProducts: Product[] = data.map(item => ({
          id: item.id,
          description: item.description,
          category: item.category,
          unit: item.unit,
          minStock: Number(item.min_stock),
          unitCost: Number(item.unit_cost),
          location: item.location,
        }));
        setProducts(parsedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoadingSuppliers(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const parsedSuppliers: Supplier[] = data.map(item => ({
          id: item.id,
          name: item.name,
          contact: item.contact,
          phone: item.phone,
          observations: item.observations,
        }));
        setSuppliers(parsedSuppliers);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoadingSuppliers(false);
    }
  }, []);

  const fetchEntries = useCallback(async () => {
    try {
      setLoadingEntries(true);
      const { data, error } = await supabase
        .from('stock_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedEntries: StockEntry[] = data.map(item => ({
          id: item.id,
          date: parseLocalDate(item.date),
          productId: item.product_id,
          quantity: Number(item.quantity),
          unitValue: Number(item.unit_value),
          supplierId: item.supplier_id || '',
          user: item.user_name,
          observations: item.observations,
          exitId: item.exit_id,
        }));
        setEntries(parsedEntries);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  const fetchExits = useCallback(async () => {
    try {
      setLoadingExits(true);
      const { data, error } = await supabase
        .from('stock_exits')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedExits: StockExit[] = data.map(item => ({
          id: item.id,
          date: parseLocalDate(item.date),
          productId: item.product_id,
          quantity: Number(item.quantity),
          unitValue: Number(item.unit_value || 0),
          destination: item.destination,
          withdrawnBy: item.withdrawn_by,
          user: item.user_name,
        }));
        setExits(parsedExits);
      }
    } catch (err) {
      console.error('Error fetching exits:', err);
    } finally {
      setLoadingExits(false);
    }
  }, []);

  const fetchTools = useCallback(async () => {
    try {
      setLoadingTools(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('description', { ascending: true });

      if (error) throw error;

      if (data) {
        const parsedTools: Tool[] = data.map(item => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
        }));
        setTools(parsedTools);
      }
    } catch (err) {
      console.error('Error fetching tools:', err);
    } finally {
      setLoadingTools(false);
    }
  }, []);

  const fetchToolCheckouts = useCallback(async () => {
    try {
      setLoadingCheckouts(true);
      const { data, error } = await supabase
        .from('tool_checkouts')
        .select('*')
        .order('checkout_date', { ascending: false });

      if (error) throw error;

      if (data) {
        const parsedCheckouts: ToolCheckout[] = data.map(item => ({
          id: item.id,
          toolId: item.tool_id,
          responsible: item.responsible,
          checkoutDate: parseLocalDate(item.checkout_date),
        }));
        setToolCheckouts(parsedCheckouts);
      }
    } catch (err) {
      console.error('Error fetching tool checkouts:', err);
    } finally {
      setLoadingCheckouts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchEntries();
    fetchExits();
    fetchTools();
    fetchToolCheckouts();
  }, [fetchProducts, fetchSuppliers, fetchEntries, fetchExits, fetchTools, fetchToolCheckouts]);

  // Supplier Actions
  const addSupplier = async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          name: supplier.name,
          contact: supplier.contact,
          phone: supplier.phone,
          observations: supplier.observations,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSupplier: Supplier = {
          id: data.id,
          name: data.name,
          contact: data.contact,
          phone: data.phone,
          observations: data.observations,
        };
        setSuppliers(prev => [newSupplier, ...prev]);
        return newSupplier;
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
    }
  };

  const updateSupplier = async (updatedSupplier: Supplier) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: updatedSupplier.name,
          contact: updatedSupplier.contact,
          phone: updatedSupplier.phone,
          observations: updatedSupplier.observations,
        })
        .eq('id', updatedSupplier.id);

      if (error) throw error;

      setSuppliers(prev => prev.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    } catch (err) {
      console.error('Error updating supplier:', err);
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting supplier:', err);
    }
  };

  // Product Actions
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          description: product.description,
          category: product.category,
          unit: product.unit,
          min_stock: product.minStock,
          unit_cost: product.unitCost,
          location: product.location,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newProduct: Product = {
          id: data.id,
          description: data.description,
          category: data.category,
          unit: data.unit,
          minStock: Number(data.min_stock),
          unitCost: Number(data.unit_cost),
          location: data.location,
        };
        setProducts(prev => [newProduct, ...prev]);
        return newProduct;
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          description: updatedProduct.description,
          category: updatedProduct.category,
          unit: updatedProduct.unit,
          min_stock: updatedProduct.minStock,
          unit_cost: updatedProduct.unitCost,
          location: updatedProduct.location,
        })
        .eq('id', updatedProduct.id);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Entry Actions
  const addEntry = async (entry: Omit<StockEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('stock_entries')
        .insert([{
          date: formatDateForInput(entry.date),
          product_id: entry.productId,
          quantity: entry.quantity,
          unit_value: entry.unitValue,
          supplier_id: entry.supplierId && entry.supplierId !== '' && entry.supplierId !== 'DEVOLUCAO' ? entry.supplierId : null,
          user_name: entry.user,
          observations: entry.observations,
          exit_id: entry.exitId,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry: StockEntry = {
          id: data.id,
          date: parseLocalDate(data.date),
          productId: data.product_id,
          quantity: Number(data.quantity),
          unitValue: Number(data.unit_value),
          supplierId: data.supplier_id || '',
          user: data.user_name,
          observations: data.observations,
          exitId: data.exit_id,
        };
        setEntries(prev => [newEntry, ...prev]);
        return newEntry;
      }
    } catch (err) {
      console.error('Error adding entry:', err);
    }
  };

  const updateEntry = async (updatedEntry: StockEntry) => {
    try {
      const { error } = await supabase
        .from('stock_entries')
        .update({
          date: formatDateForInput(updatedEntry.date),
          product_id: updatedEntry.productId,
          quantity: updatedEntry.quantity,
          unit_value: updatedEntry.unitValue,
          supplier_id: updatedEntry.supplierId && updatedEntry.supplierId !== '' && updatedEntry.supplierId !== 'DEVOLUCAO' ? updatedEntry.supplierId : null,
          user_name: updatedEntry.user,
          observations: updatedEntry.observations,
          exit_id: updatedEntry.exitId,
        })
        .eq('id', updatedEntry.id);

      if (error) throw error;

      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    } catch (err) {
      console.error('Error updating entry:', err);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Exit Actions
  const addExit = async (exit: Omit<StockExit, 'id' | 'unitValue'>) => {
    try {
      const averageValue = calculateAverageValue(entries, exit.productId);
      const product = products.find(p => p.id === exit.productId);
      const unitValue = averageValue > 0 ? averageValue : (product?.unitCost || 0);

      const { data, error } = await supabase
        .from('stock_exits')
        .insert([{
          date: formatDateForInput(exit.date),
          product_id: exit.productId,
          quantity: exit.quantity,
          unit_value: unitValue,
          destination: exit.destination,
          withdrawn_by: exit.withdrawnBy,
          user_name: exit.user,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newExit: StockExit = {
          id: data.id,
          date: parseLocalDate(data.date),
          productId: data.product_id,
          quantity: Number(data.quantity),
          unitValue: Number(data.unit_value),
          destination: data.destination,
          withdrawnBy: data.withdrawn_by,
          user: data.user_name,
        };
        setExits(prev => [newExit, ...prev]);
        return newExit;
      }
    } catch (err) {
      console.error('Error adding exit:', err);
    }
  };

  const updateExit = async (updatedExit: StockExit) => {
    try {
      const { error } = await supabase
        .from('stock_exits')
        .update({
          date: formatDateForInput(updatedExit.date),
          product_id: updatedExit.productId,
          quantity: updatedExit.quantity,
          unit_value: updatedExit.unitValue,
          destination: updatedExit.destination,
          withdrawn_by: updatedExit.withdrawnBy,
          user_name: updatedExit.user,
        })
        .eq('id', updatedExit.id);

      if (error) throw error;

      setExits(prev => prev.map(e => e.id === updatedExit.id ? updatedExit : e));
    } catch (err) {
      console.error('Error updating exit:', err);
    }
  };

  const deleteExit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stock_exits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExits(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error deleting exit:', err);
    }
  };

  const returnItemsFromExit = async (exit: StockExit, quantity: number, observation: string) => {
    const product = products.find(p => p.id === exit.productId);
    if (!product) {
      console.error("Product not found for return");
      return;
    }

    // Use the unit value stored at the time of exit
    const unitValue = exit.unitValue || product.unitCost;

    await addEntry({
      date: new Date(),
      productId: exit.productId,
      quantity,
      unitValue,
      supplierId: 'DEVOLUCAO',
      user: 'Sistema',
      observations: `Devolução da Saída ${exit.id}. ${observation}`,
      exitId: exit.id,
    });
  };

  // Tool Actions
  const getCheckedOutCount = useCallback((toolId: string) => {
    return toolCheckouts.filter(c => c.toolId === toolId).length;
  }, [toolCheckouts]);

  const addTool = async (tool: Omit<Tool, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .insert([{
          description: tool.description,
          quantity: tool.quantity,
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTool: Tool = {
          id: data.id,
          description: data.description,
          quantity: Number(data.quantity),
        };
        setTools(prev => [newTool, ...prev]);
        return newTool;
      }
    } catch (err) {
      console.error('Error adding tool:', err);
    }
  };

  const updateTool = async (updatedTool: Tool) => {
    try {
      const { error } = await supabase
        .from('tools')
        .update({
          description: updatedTool.description,
          quantity: updatedTool.quantity,
        })
        .eq('id', updatedTool.id);

      if (error) throw error;

      setTools(prev => prev.map(t => t.id === updatedTool.id ? updatedTool : t));
    } catch (err) {
      console.error('Error updating tool:', err);
    }
  };

  const deleteTool = async (id: string) => {
    if (getCheckedOutCount(id) > 0) {
      alert('Não é possível excluir uma ferramenta que possui unidades em uso.');
      return;
    }
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTools(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting tool:', err);
    }
  };

  const checkoutTool = async (toolId: string, responsible: string, quantity: number) => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;
    const available = tool.quantity - getCheckedOutCount(toolId);
    if (quantity > available) {
      alert(`Quantidade indisponível. Apenas ${available} unidades disponíveis.`);
      return;
    }

    try {
      const checkoutsToInsert = Array.from({ length: quantity }, () => ({
        tool_id: toolId,
        responsible: responsible,
        checkout_date: formatDateForInput(new Date()),
      }));

      const { data, error } = await supabase
        .from('tool_checkouts')
        .insert(checkoutsToInsert)
        .select();

      if (error) throw error;

      if (data) {
        const newCheckouts: ToolCheckout[] = data.map(item => ({
          id: item.id,
          toolId: item.tool_id,
          responsible: item.responsible,
          checkoutDate: parseLocalDate(item.checkout_date),
        }));
        setToolCheckouts(prev => [...prev, ...newCheckouts]);
      }
    } catch (err) {
      console.error('Error checking out tool:', err);
    }
  };

  const returnTool = async (checkoutId: string) => {
    try {
      const { error } = await supabase
        .from('tool_checkouts')
        .delete()
        .eq('id', checkoutId);

      if (error) throw error;

      setToolCheckouts(prev => prev.filter(c => c.id !== checkoutId));
    } catch (err) {
      console.error('Error returning tool:', err);
    }
  };

  const getStockLevel = useCallback((productId: string) => {
    const totalEntries = entries.filter(e => e.productId === productId).reduce((sum, e) => sum + e.quantity, 0);
    const totalExits = exits.filter(e => e.productId === productId).reduce((sum, e) => sum + e.quantity, 0);
    return totalEntries - totalExits;
  }, [entries, exits]);

  return {
    suppliers, addSupplier, updateSupplier, deleteSupplier, loadingSuppliers,
    products, addProduct, updateProduct, deleteProduct, loading,
    entries, addEntry, updateEntry, deleteEntry, loadingEntries,
    exits, addExit, updateExit, deleteExit, loadingExits, returnItemsFromExit,
    tools, addTool, updateTool, deleteTool, loadingTools,
    toolCheckouts, checkoutTool, returnTool, getCheckedOutCount, loadingCheckouts,
    getStockLevel
  };
};
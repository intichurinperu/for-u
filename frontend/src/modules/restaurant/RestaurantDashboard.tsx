import { Card as DSCard } from '../../components/ui/DesignSystem';
import { ButtonSecondary as DSButtonSecondary, Input as DSInput } from '../../components/ui/DesignSystem';
import { useModuleDraft } from '../useModuleDraft';
import { useState, type FormEvent } from 'react';
import { prepareRecipe, preparationImpact, saveIngredient, validateRecipe, type Ingredient, type Recipe } from './model';
import type { RestaurantEditorProps } from './RestaurantEditor';
import './restaurant.css';

export default function RestaurantDashboard({ data, onChange }: RestaurantEditorProps) {
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [preparation, setPreparation] = useState<{ recipeId: string; operationId: string; batches: number } | null>(null);
  const [message, setMessage] = useState('');
  useModuleDraft(!!ingredient || !!recipe || !!preparation);
  const activeRecipe = data.recipes.find(item => item.id === preparation?.recipeId);
  let impact: ReturnType<typeof preparationImpact> = [];
  let preparationError = '';
  if (activeRecipe && preparation) {
    try { impact = preparationImpact(data, activeRecipe, preparation.batches); }
    catch (error) { preparationError = error instanceof Error ? error.message : 'Revisa la receta.'; }
  }
  function submitIngredient(event: FormEvent) {
    event.preventDefault(); if (!ingredient) return;
    try { onChange(saveIngredient(data, ingredient)); setIngredient(null); setMessage('Inventario actualizado.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  function submitRecipe(event: FormEvent) {
    event.preventDefault(); if (!recipe) return;
    try {
      validateRecipe(data, recipe);
      onChange({ ...data, recipes: data.recipes.some(item => item.id === recipe.id) ? data.recipes.map(item => item.id === recipe.id ? recipe : item) : [...data.recipes, recipe] });
      setRecipe(null); setMessage('Receta guardada.');
    } catch (error) { setMessage((error as Error).message); }
  }
  function confirmPreparation() {
    if (!preparation) return;
    try { onChange(prepareRecipe(data, preparation.recipeId, preparation.batches, preparation.operationId)); setPreparation(null); setMessage('Preparación registrada. Inventario descontado.'); }
    catch (error) { setMessage((error as Error).message); }
  }
  return <div className="restaurant-module">
    <h1>Logística y recetas</h1><p role="status">{message}</p>
    <div className="restaurant-metrics">
      <DSCard as="article" className="component-card"><h2>Recetas</h2><strong>{data.recipes.length}</strong></DSCard>
      <DSCard as="article" className="component-card"><h2>Preparaciones registradas</h2><strong>{data.preparations.length}</strong></DSCard>
      <DSCard as="article" className="component-card"><h2>Ingredientes por reponer</h2><strong>{data.inventory.filter(item => item.stock <= item.minimum).length}</strong></DSCard>
    </div>
    <DSCard as="section" className="component-card">
      <div className="component-header"><h2>Hoy quiero preparar…</h2><DSButtonSecondary type="button" onClick={() => setRecipe({ id: crypto.randomUUID(), name: '', portions: 1, ingredients: [] })}>Nueva receta</DSButtonSecondary></div>
      {!data.recipes.length && <p>Agrega ingredientes al inventario y crea tu primera receta.</p>}
      <div className="menu-grid">{data.recipes.map(item => <DSCard as="article" className="dish-card dish-card-body" key={item.id}>
        <h3>{item.name}</h3><p>{item.portions} porciones por lote</p>
        <div className="restaurant-actions"><DSButtonSecondary type="button" onClick={() => setPreparation({ recipeId: item.id, operationId: crypto.randomUUID(), batches: 1 })}>Preparar {item.name}</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setRecipe(structuredClone(item))}>Editar receta</DSButtonSecondary></div>
      </DSCard>)}</div>
      {recipe && <form className="restaurant-form" onSubmit={submitRecipe}>
        <h3>Receta</h3><label>Nombre de receta<DSInput required value={recipe.name} onChange={event => setRecipe({ ...recipe, name: event.target.value })} /></label>
        <label>Porciones por lote<DSInput required type="number" min="1" step="1" value={Number.isFinite(recipe.portions) ? recipe.portions : ''} onChange={event => setRecipe({ ...recipe, portions: event.target.valueAsNumber })} /></label>
        {recipe.ingredients.map((row, index) => <fieldset key={index} className="restaurant-fields"><legend>Ingrediente {index + 1}</legend>
          <label>Ingrediente<select required value={row.ingredientId} onChange={event => setRecipe({ ...recipe, ingredients: recipe.ingredients.map((value, i) => i === index ? { ...value, ingredientId: event.target.value } : value) })}>
            <option value="">Selecciona</option>{data.inventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}
          </select></label>
          <label>Cantidad por lote<DSInput type="number" min="0.000001" step="any" required value={Number.isFinite(row.quantity) ? row.quantity : ''} onChange={event => setRecipe({ ...recipe, ingredients: recipe.ingredients.map((value, i) => i === index ? { ...value, quantity: event.target.valueAsNumber } : value) })} /></label>
          <DSButtonSecondary type="button" onClick={() => setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((_, i) => i !== index) })}>Quitar ingrediente {index + 1}</DSButtonSecondary>
        </fieldset>)}
        <DSButtonSecondary type="button" disabled={!data.inventory.length} onClick={() => setRecipe({ ...recipe, ingredients: [...recipe.ingredients, { ingredientId: '', quantity: 1 }] })}>Agregar ingrediente a receta</DSButtonSecondary>
        <div className="restaurant-actions"><DSButtonSecondary type="submit">Guardar receta</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setRecipe(null)}>Cancelar receta</DSButtonSecondary></div>
      </form>}
      {preparation && activeRecipe && <section className="restaurant-form" aria-label="Confirmar preparación">
        <h3>{activeRecipe.name}</h3><label>Lotes a preparar<DSInput type="number" min="1" step="1" value={Number.isFinite(preparation.batches) ? preparation.batches : ''} onChange={event => setPreparation({ ...preparation, batches: event.target.valueAsNumber })} /></label>
        <p>{Number.isFinite(preparation.batches) ? preparation.batches * activeRecipe.portions : 0} porciones</p>
        {preparationError && <p role="alert">{preparationError}</p>}
        <div className="restaurant-table"><table><thead><tr><th>Ingrediente</th><th>Necesitas</th><th>Disponible</th><th>Quedará</th></tr></thead><tbody>{impact.map(row => <tr key={row.id}><th>{row.name}</th><td>{row.required.toFixed(3)} {row.unit}</td><td>{row.stock} {row.unit}</td><td>{row.remaining < 0 ? 'Insuficiente' : `${row.remaining} ${row.unit}`}</td></tr>)}</tbody></table></div>
        <div className="restaurant-actions"><DSButtonSecondary type="button" disabled={!!preparationError || !impact.length || impact.some(row => row.remaining < 0)} onClick={confirmPreparation}>Confirmar y descontar</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setPreparation(null)}>Cancelar preparación</DSButtonSecondary></div>
      </section>}
    </DSCard>
    <DSCard as="section" className="component-card">
      <div className="component-header"><h2>Inventario</h2><DSButtonSecondary type="button" onClick={() => setIngredient({ id: crypto.randomUUID(), name: '', stock: 0, minimum: 0, unit: 'unidades' })}>Agregar ingrediente</DSButtonSecondary></div>
      {ingredient && <form onSubmit={submitIngredient} className="restaurant-form">
        <label>Nombre del ingrediente<DSInput required value={ingredient.name} onChange={event => setIngredient({ ...ingredient, name: event.target.value })} /></label>
        <label>Unidad<select value={ingredient.unit} onChange={event => setIngredient({ ...ingredient, unit: event.target.value as Ingredient['unit'] })}>{['kg', 'g', 'l', 'ml', 'unidades'].map(unit => <option key={unit}>{unit}</option>)}</select></label>
        <label>Cantidad disponible<DSInput required type="number" min="0" step="any" value={Number.isFinite(ingredient.stock) ? ingredient.stock : ''} onChange={event => setIngredient({ ...ingredient, stock: event.target.valueAsNumber })} /></label>
        <label>Alerta cuando quede<DSInput required type="number" min="0" step="any" value={Number.isFinite(ingredient.minimum) ? ingredient.minimum : ''} onChange={event => setIngredient({ ...ingredient, minimum: event.target.valueAsNumber })} /></label>
        <div className="restaurant-actions"><DSButtonSecondary type="submit">Guardar ingrediente</DSButtonSecondary><DSButtonSecondary type="button" onClick={() => setIngredient(null)}>Cancelar ingrediente</DSButtonSecondary></div>
      </form>}
      <div className="menu-grid">{data.inventory.map(item => <DSCard as="article" key={item.id} className="dish-card dish-card-body"><h3>{item.name}</h3><p>{item.stock} {item.unit}</p>{item.stock <= item.minimum && <p>Necesita reposición</p>}<DSButtonSecondary type="button" onClick={() => setIngredient({ ...item })}>Actualizar {item.name}</DSButtonSecondary></DSCard>)}</div>
    </DSCard>
  </div>;
}

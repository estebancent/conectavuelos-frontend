<script setup>
import { onMounted, watch ,computed, ref } from 'vue'

import { 
  Plus, ImageIcon, X, Trash, Loader2, Pencil ,ChevronDown, ChevronRight, Settings2, Lock
} from 'lucide-vue-next'
import { useToast } from "vue-toastification"
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const toast = useToast()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const brandStore = useBrandStore()

const mostrarForm = ref(false)
const isEditing = ref(false)
const currentId = ref(null)
const sending = ref(false)

const form = ref({
  name: '',
  description: '',
  category_id: '',
  brand_id: '',
  purchase_price: 0,
  sale_price: 0,
  profit_margin: 0,
  
  // 📸 MANEJO DE IMÁGENES:
  image: null,           // Aquí guardaremos el ARCHIVO (File) cuando selecciones uno nuevo.
  old_image_path: null,  // Aquí guardaremos la RUTA (String) que viene de la DB al editar.

  variants: [{ size: '', color: '', sku: '', stock: 0 }]
})

// UNIFICAMOS EL ONMOUNTED Y CORREGIMOS EL ERROR
onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    categoryStore.fetchCategories(),
    brandStore.fetchBrands()
  ])
})

const agregarVariante1 = () => {
  form.value.variants.push({ size: '', color: '#6366f1', sku: '', stock: 0 })
}
const agregarVariante = () => {
  form.value.variants.push({
    size: '',
    stock: 0,
    sku: '',
    color: '#6366f1' // Un color por defecto (ej. Indigo 500)
  })
}

const eliminarVariante = (index) => {
  if (form.value.variants.length > 1) form.value.variants.splice(index, 1)
}

const handleImage1 = (e) => {
  form.value.image = e.target.files[0]
}
const handleImage = (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 1. Validar Tipo de Archivo (Solo imágenes comunes)
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!tiposPermitidos.includes(file.type)) {
    toast.error('Archivo no permitido. Usa JPG, PNG o WEBP.')
    e.target.value = '' // Resetea el input
    return
  }

  // 2. Validar Tamaño (Ejemplo: máximo 2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('La imagen es muy pesada. Máximo 2MB.')
    e.target.value = ''
    return
  }

  // 3. Asignar al formulario para previsualización
  // Esto disparará automáticamente el v-if="form.image" en tu HTML
  form.value.image = file
}
const abrirModalCrear = () => {
  isEditing.value = false
  form.value = {
    name: '', description: '', category_id: '', brand_id: '',
    purchase_price: 0, sale_price: 0, profit_margin: 0, image_path: null,
    image: null,
    variants: [{ size: '', color: '', sku: '', stock: 0 }]
  }
  mostrarForm.value = true
}
  

const abrirModalEditar = (product) => {
  isEditing.value = true;
  currentId.value = product.id;
  
  form.value = {
    name: product.name,
    description: product.description,
    category_id: product.category_id,
    brand_id: product.brand_id,
    purchase_price: product.purchase_price,
    sale_price: product.sale_price,
    profit_margin: product.profit_margin,
    image_path: null, // Siempre null al inicio porque el input file empieza vacío
    image: null, // El archivo nuevo que el usuario quiera subir (si lo hace)
    old_image_path: product.image_path, // <--- GUARDAMOS LA RUTA DE LA DB AQUÍ
    
    variants: product.variants.map(v => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock
    }))
  };
  
  mostrarForm.value = true;
};

const guardarProducto = async () => {
  sending.value = true
  const fd = new FormData()
  
  // Campos básicos
  fd.append('name', form.value.name)
  fd.append('description', form.value.description || '')
  fd.append('category_id', form.value.category_id)
  fd.append('brand_id', form.value.brand_id)
  fd.append('purchase_price', form.value.purchase_price)
  fd.append('sale_price', form.value.sale_price)
  fd.append('profit_margin', form.value.profit_margin)
  
  // ENVIAR IMAGEN: Usamos la llave 'image_path' para que coincida con tu validate
  if (form.value.image) {
    fd.append('image_path', form.value.image) 
  }
  
  // Variantes
  form.value.variants.forEach((v, i) => {
    fd.append(`variants[${i}][size]`, v.size)
    fd.append(`variants[${i}][color]`, v.color || '')
    fd.append(`variants[${i}][sku]`, v.sku)
    fd.append(`variants[${i}][stock]`, v.stock)
  })

  try {
    if (isEditing.value) {
      // TRUCO VITAL: Laravel no entiende archivos en PUT real, 
      // por eso enviamos POST + _method = PUT
      fd.append('_method', 'PUT') 
      await productStore.updateProducts(currentId.value, fd)
      toast.success("¡Producto y variantes actualizados!")
    } else {
      await productStore.addProducts(fd)
      toast.success("¡Producto creado con éxito!")
    }
    mostrarForm.value = false
  } catch (err) {
    console.error("Error completo:", err)
    toast.error("Error al guardar. Revisa la consola del navegador.")
  } finally {
    sending.value = false
  }
}
const expandedRows = ref([])

const toggleRow = (id) => {
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(rowId => rowId !== id)
  } else {
    expandedRows.value.push(id)
  }
}

const sumarStock = (variants) => {
  if (!variants) return 0;
  return variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
}
// 1. Cuando cambia el Costo o el Margen -> Calculamos Venta
watch([() => form.value.purchase_price, () => form.value.profit_margin], ([newCost, newMargin]) => {
  const cost = parseFloat(newCost) || 0
  const margin = parseFloat(newMargin) || 0
  
  if (cost > 0) {
    // Fórmula: Venta = Costo + (Costo * Margen / 100)
    const calculatedSale = cost + (cost * margin / 100)
    // Redondeamos a 2 decimales para que no queden números feos
    form.value.sale_price = parseFloat(calculatedSale.toFixed(2))
  }
})

// 2. Cuando cambia la Venta manualmente -> Recalculamos el Margen
// Usamos un pequeño truco para que solo actúe si el foco está en el input de venta (opcional)
watch(() => form.value.sale_price, (newSale) => {
  const sale = parseFloat(newSale) || 0
  const cost = parseFloat(form.value.purchase_price) || 0

  if (cost > 0 && sale > 0) {
    // Fórmula: Margen = ((Venta - Costo) / Costo) * 100
    const calculatedMargin = ((sale - cost) / cost) * 100
    form.value.profit_margin = parseFloat(calculatedMargin.toFixed(2))
  }
})
// Detectamos si el precio de venta es menor o igual al de costo (hay pérdida o no hay ganancia)
const hayPerdida = computed(() => {
  const costo = parseFloat(form.value.purchase_price) || 0
  const venta = parseFloat(form.value.sale_price) || 0
  // Solo validamos si ambos tienen valores mayores a 0 para no molestar al empezar a escribir
  return costo > 0 && venta > 0 && venta <= costo
})
const generarSKU = (productoNombre, brandId, variante) => {
  if (!productoNombre) return ''

  // 1. Obtener Marca (desde brandStore)
  const listaMarcas = brandStore.brands || []
  const marcaObj = listaMarcas.find(b => String(b.id) === String(brandId))
  const prefijoMarca = marcaObj ? marcaObj.name.trim().substring(0, 3).toUpperCase() : 'GEN'

  // 2. Prefijo Producto (3 letras)
  const prefijoProducto = productoNombre.trim().substring(0, 3).toUpperCase()

  // 3. Talle (Si está vacío pone 00)
  const talle = variante.size ? variante.size.toString().toUpperCase().replace(/\s+/g, '') : '00'
  
  // 4. Color (Quitamos el # y tomamos los últimos 4 caracteres)
  // Si no hay color, ponemos 0000
  const colorId = variante.color 
    ? variante.color.replace('#', '').substring(2, 6).toUpperCase() 
    : '0000'

  return `${prefijoMarca}-${prefijoProducto}-${talle}-${colorId}`
}

// BORRA los dos watch anteriores de SKU y pega este solo:

watch(
  () => [form.value.name, form.value.brand_id, form.value.variants],
  ([newName, newBrandId, newVariants]) => {
    // Si no hay nombre o marca, no hacemos nada para evitar cálculos innecesarios
    if (!newName || !newBrandId) return;

    newVariants.forEach((v) => {
      // Solo generamos el SKU si tiene Talle y Color seleccionados
      if (v.size && v.color) {
        const brand = brandStore.brands.find(b => String(b.id) === String(newBrandId));
        const brandName = brand ? brand.name.substring(0, 2).toUpperCase() : 'GN';
        const productName = newName.trim().substring(0, 3).toUpperCase();
        
        // Buscamos el nombre del color en tu array de coloresEstandar
        const colorObj = coloresEstandar.find(c => c.hex === v.color);
        const colorName = colorObj ? colorObj.nombre.substring(0, 2).toUpperCase() : '00';
        const sizeName = v.size.toString().toUpperCase().replace(/\s+/g, '');

        const nuevoSku = `${brandName}-${productName}-${colorName}-${sizeName}`;

        // IMPORTANTE: Solo asignar si el SKU es diferente al actual
        // Esto rompe el bucle infinito
        if (v.sku !== nuevoSku) {
          v.sku = nuevoSku;
        }
      }
    });
  },
  { deep: true }
);
const coloresEstandar = [
  { nombre: 'Blanco', hex: '#FFFFFF' },
  { nombre: 'Negro', hex: '#000000' },
  { nombre: 'Gris', hex: '#94A3B8' },
  { nombre: 'Rojo', hex: '#EF4444' },
  { nombre: 'Azul', hex: '#3B82F6' },
  { nombre: 'Verde', hex: '#22C55E' },
  { nombre: 'Amarillo', hex: '#EAB308' },
  { nombre: 'Naranja', hex: '#F97316' },
  { nombre: 'Rosa', hex: '#EC4899' },
  { nombre: 'Violeta', hex: '#A855F7' },
  { nombre: 'Beige', hex: '#F5F5DC' },
  { nombre: 'Marino', hex: '#1E3A8A' },
]

// Función para seleccionar el color al hacer clic
const seleccionarColor = (variante, colorHex) => {
  variante.color = colorHex
}
const abrirAjusteManual = (variante) => {
  Swal.fire({
    title: 'Ajuste de Inventario',
    html: `Stock actual: <b>${variante.stock}</b> unidades`,
    input: 'number',
    inputLabel: 'Cantidad a sumar o restar',
    inputPlaceholder: 'Ej: 5 para sumar, -2 para restar',
    showCancelButton: true,
    confirmButtonText: 'Aplicar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4f46e5',
  }).then((result) => {
    // Validamos que se haya ingresado un valor y se haya confirmado
    if (result.isConfirmed && result.value) {
      const ajuste = parseInt(result.value);
      const nuevoStock = parseInt(variante.stock) + ajuste;

      if (nuevoStock < 0) {
        toast.error("El stock no puede ser negativo");
      } else {
        variante.stock = nuevoStock; // Vue detectará este cambio automáticamente
        toast.success(`Stock actualizado a ${nuevoStock}`);
      }
    }
  });
};

const previewImage = computed(() => {
  if (form.value.image && form.value.image instanceof File) {
    return URL.createObjectURL(form.value.image);
  }
  return null;
});
// Definimos la base del storage para usarla en el template
const storageBase = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';
</script>

<template>
  <div class="p-6 space-y-6 animate-in fade-in duration-500">
    
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-black text-slate-800 dark:text-white">Productos</h2>
        <p class="text-sm text-slate-500">Gestión de inventario y talles</p>
      </div>
      <button v-if="!mostrarForm" @click="abrirModalCrear" 
        class="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-green-700 transition-all">
        <Plus class="w-5 h-5" /> Nuevo Producto
      </button>
      <button v-else @click="mostrarForm = false" 
        class="text-slate-500 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        Volver al listado
      </button>
    </div>

    <div v-if="!mostrarForm">
      <div v-if="productStore.loading" class="flex justify-center p-12">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
      </div>
      
      <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr class="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                <th class="px-6 py-4 w-10"></th> 
                <th class="px-6 py-4">Producto</th>
                <th class="px-6 py-4 hidden lg:table-cell">Categoría / Marca</th>
                <th class="px-6 py-4 text-center">Stock Total</th>
                <th class="px-6 py-4 text-center">Venta</th>
                <th class="px-6 py-4 text-center hidden md:table-cell">Margen</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            
            <tbody v-for="product in productStore.products" :key="product.id" class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr @click="toggleRow(product.id)" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
                <td class="px-6 py-4">
                  <component :is="expandedRows.includes(product.id) ? ChevronDown : ChevronRight" 
                             class="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </td>
               <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                   <img 
                    v-if="product.image_path" 
                    :src="`${storageBase}/${product.image_path}`" 
                    class="object-cover w-full h-full"
                    >
                    <ImageIcon v-else class="w-full h-full p-3 text-slate-300 dark:text-slate-600" />
                  </div> <div>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none mb-1">{{ product.name }}</p>
                    <p class="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 max-w-[200px]">{{ product.description }}</p>
                  </div>
                </div>
              </td>
                <td class="px-6 py-4 hidden lg:table-cell">
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ product.category?.name }}</span>
                    <span class="text-[10px] text-slate-400">{{ product.brand?.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="inline-flex flex-col items-center">
                    <span :class="['text-sm font-black', sumarStock(product.variants) <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-700 dark:text-slate-200']">
                      {{ sumarStock(product.variants) }}
                    </span>
                    <span class="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">unidades</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <p class="text-sm font-black text-green-600 dark:text-green-500">${{ product.sale_price }}</p>
                  <p class="text-[9px] text-slate-400 line-through">${{ product.purchase_price }}</p>
                </td>
                <td class="px-6 py-4 text-center hidden md:table-cell">
                  <span :class="['px-2 py-1 rounded-lg text-[10px] font-black', 
                    product.profit_margin >= 40 ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20']">
                    {{ product.profit_margin }}%
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click.stop="abrirModalEditar(product)" class="p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all">
                    <Pencil class="w-4 h-4" />
                  </button>
                </td>
              </tr>

              <tr v-if="expandedRows.includes(product.id)" class="bg-slate-50/50 dark:bg-slate-800/30">
                <td colspan="7" class="px-6 py-4">
                  <div class="flex flex-wrap gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div v-for="v in product.variants" :key="v.id" 
                         class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center gap-4 min-w-[140px] shadow-sm group">
                      <div class="relative flex-shrink-0">
                        <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-black text-xs border border-slate-200 dark:border-slate-700">
                          {{ v.size }}
                        </div>
                        <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
                             :style="{ backgroundColor: v.color || '#e2e8f0' }" :title="v.color">
                        </div>
                      </div>
                      <div class="flex-shrink-0">
                        <p class="text-[9px] text-slate-400 uppercase font-black tracking-tighter leading-none mb-1">Stock</p>
                        <p :class="['text-xs font-black', v.stock <= 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200']">
                          {{ v.stock }} <span class="text-[9px] font-normal text-slate-400">uds</span>
                        </p>
                      </div>
                      <div class="border-l border-slate-100 dark:border-slate-800 pl-4">
                        <p class="text-[9px] text-slate-400 uppercase font-black tracking-tighter leading-none mb-1">SKU</p>
                        <p class="text-[10px] font-mono font-bold text-slate-500 group-hover:text-indigo-500 transition-colors">
                          {{ v.sku }}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 class="input-label !text-indigo-500 !mb-4">Información Principal</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="input-label">Nombre</label>
              <input v-model="form.name" type="text" class="custom-input">
            </div>
            <div>
              <label class="input-label">Categoría</label>
              <select v-model="form.category_id" class="custom-input">
                <option value="" disabled>Seleccionar Categoría</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="input-label">Marca</label>
              <select v-model="form.brand_id" class="custom-input">
                <option value="" disabled>Seleccionar Marca</option>
                <option v-for="b in brandStore.brands" :key="b.id" :value="b.id">{{ b.name }}</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="input-label">Descripción</label>
              <textarea v-model="form.description" class="custom-input h-24 pt-2"></textarea>
            </div>
          </div>
        </div>
        
        <div :class="['bg-white dark:bg-slate-900 p-8 rounded-[2rem] border transition-all duration-300 shadow-sm space-y-4', 
             hayPerdida ? 'border-rose-500 shadow-rose-50 dark:border-rose-800' : 'border-slate-200 dark:border-slate-800']">
          <div class="flex justify-between items-center px-1">
            <h3 :class="['text-[10px] font-black uppercase tracking-widest transition-colors', hayPerdida ? 'text-rose-500' : 'text-slate-400']">
              {{ hayPerdida ? '⚠️ Alerta de Margen' : 'Calculadora de Precios' }}
            </h3>
            <span v-if="form.purchase_price > 0 && !hayPerdida" class="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">Sincronizado</span>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="input-label">Costo</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input v-model="form.purchase_price" type="number" step="0.01" class="custom-input !pl-7">
              </div>
            </div>
            <div>
              <label class="input-label">Margen %</label>
              <div class="relative">
                <input v-model="form.profit_margin" type="number" step="0.1" :class="['custom-input !pr-8', hayPerdida ? '!text-rose-600 !border-rose-300' : '']">
                <span class="absolute right-3 top-2.5 text-slate-400 text-sm">%</span>
              </div>
            </div>
            <div>
              <label class="input-label">Venta</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                <input v-model="form.sale_price" type="number" step="0.01" :class="['custom-input !pl-7', hayPerdida ? 'bg-rose-50/50 !text-rose-700' : 'border-indigo-200']">
              </div>
            </div>
          </div>
          <div class="px-1 min-h-[1.25rem]">
            <p v-if="hayPerdida" class="text-[10px] text-rose-600 font-bold flex items-center gap-1"><AlertTriangle class="w-3.5 h-3.5" /> Pérdida detectada.</p>
            <p v-else-if="form.purchase_price > 0" class="text-[10px] text-slate-400 dark:text-slate-500 italic">
              * Ganancia: <span class="text-green-600 font-bold">${{ (form.sale_price - form.purchase_price).toFixed(2) }}</span>
            </p>
          </div>
        </div>
      </div>

    <div class="space-y-6">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <label class="input-label mb-3 block">Imagen del producto</label>
          <div class="relative w-full aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center overflow-hidden group">
            <input type="file" @change="handleImage" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer z-10">
            
            <template v-if="form.image">
              <img :src="previewImage" class="w-full h-full object-cover">
              <button @click.stop="form.image = null" class="absolute top-2 right-2 z-30 bg-rose-500 text-white p-1.5 rounded-full shadow-lg">
                <X class="w-3 h-3" />
              </button>
            </template>
            
            <img v-else-if="isEditing && form.old_image_path" 
                :src="`${storageBase}/${form.old_image_path}`" 
                class="w-full h-full object-cover opacity-80">
            
            <div v-else class="flex flex-col items-center gap-2 text-slate-300">
              <ImageIcon class="w-10 h-10" />
              <span class="text-[10px] font-bold uppercase">Subir Imagen</span> 
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div class="flex justify-between items-center px-1">
            <h3 class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Variantes</h3>
            <button @click="agregarVariante" class="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">+ Añadir</button>
          </div>
          
          <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            <div v-for="(v, i) in form.variants" :key="i" class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl relative border border-slate-100 dark:border-slate-700 space-y-3">
              <button @click="eliminarVariante(i)" class="absolute top-3 right-3 text-slate-300 hover:text-rose-500"><X class="w-4 h-4"/></button>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="input-label">Talle</label>
                    <input v-model="v.size" class="custom-input !py-1.5 !text-xs">
                </div>

                <div>
                    <label class="input-label">Stock Actual</label>
                    <div class="relative group">
                    <input v-model="v.stock" :readonly="isEditing" type="number" 
                           :class="['custom-input !py-1.5 !text-xs transition-all', isEditing ? 'bg-slate-100 dark:bg-slate-800/80 cursor-not-allowed border-dashed' : '']">
                    <button v-if="isEditing" @click.stop="abrirAjusteManual(v)" 
                            class="absolute right-2 top-1.5 p-1 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-lg text-indigo-600 hover:scale-110 transition-transform">
                        <Settings2 class="w-3.5 h-3.5" />
                    </button>
                    </div>
                </div>
              </div>

              <div>
                <label class="input-label">Color: <span class="text-indigo-500">{{ coloresEstandar.find(c => c.hex === v.color)?.nombre || 'N/A' }}</span></label>
                <div class="flex flex-wrap gap-2 mt-1 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button v-for="color in coloresEstandar" :key="color.hex" type="button" @click="seleccionarColor(v, color.hex)"
                          :class="['w-6 h-6 rounded-full border-2 transition-all', v.color === color.hex ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent']"
                          :style="{ backgroundColor: color.hex }"></button>
                </div>
              </div>

              <div>
                <label class="input-label">SKU Autogenerado</label>
                <div class="relative group">
                  <input v-model="v.sku" readonly class="custom-input !py-1.5 !text-[10px] font-mono bg-slate-100 dark:bg-slate-800/80 border-dashed">
                  <Lock class="w-3 h-3 absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="guardarProducto" :disabled="sending" 
                class="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-50 hover:bg-indigo-700 transition-all active:scale-[0.98]">
          <span v-if="!sending">{{ isEditing ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO' }}</span>
          <Loader2 v-else class="w-6 h-6 animate-spin mx-auto" />
        </button>
      </div> </div> </div> </template>

<style scoped>
.input-label { 
  @apply text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1 ml-1; 
}

.custom-input { 
  @apply w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
         rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none text-sm font-bold 
         text-slate-700 dark:text-slate-200 transition-all; 
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-200 dark:bg-slate-700 rounded-full; }
</style>

import json
import os

# Path to translations
es_path = r'src/assets/i18n/es.json'
en_path = r'src/assets/i18n/en.json'

# Spanish translations
es_inventory = {
    "BREADCRUMB": "Inventario",
    "TITLE": "Gestión de Productos",
    "DESCRIPTION": "Administra tu inventario de productos, rastrea niveles de stock y actualiza precios en todos los canales de venta.",
    "NEW_PRODUCT": "Nuevo Producto",
    "ALL_PRODUCTS": "Todos los Productos",
    "LOW_STOCK": "Stock Bajo",
    "OUT_OF_STOCK": "Sin Stock",
    "IN_STOCK": "En Stock",
    "SEARCH_PLACEHOLDER": "Buscar por Nombre, SKU o Etiqueta...",
    "SKU": "SKU",
    "NAME": "Nombre",
    "STOCK": "Stock",
    "COST_PRICE": "Precio de Costo",
    "SALE_PRICE": "Precio de Venta",
    "ACTIONS": "Acciones",
    "LOADING": "Cargando productos...",
    "NO_PRODUCTS": "No hay productos disponibles",
    "OUT_OF_STOCK_LABEL": "Agotado",
    "LOW_STOCK_LABEL": "Bajo",
    "SHOWING": "Mostrando",
    "TO": "a",
    "OF": "de",
    "RESULTS": "resultados",
    "PREVIOUS": "Anterior",
    "NEXT": "Siguiente"
}

# English translations
en_inventory = {
    "BREADCRUMB": "Inventory",
    "TITLE": "Product Management",
    "DESCRIPTION": "Manage your product inventory, track stock levels, and update pricing across all sales channels.",
    "NEW_PRODUCT": "New Product",
    "ALL_PRODUCTS": "All Products",
    "LOW_STOCK": "Low Stock",
    "OUT_OF_STOCK": "Out of Stock",
    "IN_STOCK": "In Stock",
    "SEARCH_PLACEHOLDER": "Search by Name, SKU or Tag...",
    "SKU": "SKU",
    "NAME": "Name",
    "STOCK": "Stock",
    "COST_PRICE": "Cost Price",
    "SALE_PRICE": "Sale Price",
    "ACTIONS": "Actions",
    "LOADING": "Loading products...",
    "NO_PRODUCTS": "No products available",
    "OUT_OF_STOCK_LABEL": "Out",
    "LOW_STOCK_LABEL": "Low",
    "SHOWING": "Showing",
    "TO": "to",
    "OF": "of",
    "RESULTS": "results",
    "PREVIOUS": "Previous",
    "NEXT": "Next"
}

# Update Spanish
with open(es_path, 'r', encoding='utf-8') as f:
    es_data = json.load(f)
es_data['INVENTORY'] = es_inventory
with open(es_path, 'w', encoding='utf-8') as f:
    json.dump(es_data, f, ensure_ascii=False, indent=4)

# Update English
with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)
en_data['INVENTORY'] = en_inventory
with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=4)

print("✅ Traducciones agregadas exitosamente")

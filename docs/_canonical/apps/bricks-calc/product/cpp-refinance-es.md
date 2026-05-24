---
title: Bricks Calc Custom Product Page — Refinance (ES)
doc_id: bricks-calc-product-cpp-refinance-es
doc_type: product
role: canonical
app_scope: bricks-calc
owner: Freddy
status: needs-review
last_reviewed: 2026-05-24
review_cycle: quarterly
replacement_path:
derived_from:
source_links:
tags:
  - calc
  - app-store
  - cpp
  - refinance
  - es
---

# Bricks Calc — Custom Product Page de Refinanciamiento

Última actualización: 28 de abril de 2026

## Objetivo

Crear una custom product page enfocada en refinanciamiento para Bricks Calc con una pregunta central:

¿Refinanciar realmente me conviene?

Esta página debe hablarle a personas que ya tienen un crédito hipotecario y quieren comparar su crédito actual con una nueva tasa, cuota o plazo.

## Audiencia

- Propietarios con un crédito vigente
- Personas evaluando ofertas para refinanciar
- Usuarios comparando una cuota menor, una mejor tasa o un plazo distinto

No es una página para compradores primerizos. Evitar lenguaje de búsqueda de inmueble, cuota inicial o PMI como mensaje principal, salvo que apoye directamente la decisión de refinanciar.

## Posicionamiento

Primero decir el beneficio concreto:

Compara el crédito actual con una nueva tasa, cuota y plazo antes de refinanciar.

Luego respaldarlo con el producto:

Revisa la nueva cuota, el punto en que se compensa el cambio, la amortización y los pagos extra con los mismos números a la vista.

## Configuración en App Store Connect

### Nombre de referencia

```text
Refinanciamiento
```

### Página base para duplicar

Partir de la ficha actual de Bricks Calc y reemplazar capturas y promotional text para que toda la página responda a intención de refinanciamiento.

### Promotional Text

```text
Compara tu crédito actual con una nueva tasa, cuota y plazo. Bricks Calc te ayuda a ver cuándo refinanciar empieza a convenir.
```

### Keywords

Usar una combinación separada de la CPP para compradores. Astro muestra que, para Perú y español, `prestamo` y `prestamos` pueden tener más popularidad, pero también atraen búsquedas de dinero rápido, bancos y créditos personales. Para esta CPP, esos términos son apoyo secundario. La historia principal debe ser `refinanciamiento`, `refinanciar`, `cuota`, `tasa`, `plazo` y `crédito hipotecario`.

Recomendadas:

- `calculadora`
- `hipotecaria`
- `cuota`
- `interes`
- `refinanciar`
- `prestamo`

Si App Store Connect permite solo marcar keywords existentes de tu versión actual, priorizar:

- `loan`
- `calculator`
- `payment`
- `interest`
- `refinance`
- `amortization`

No priorizar:

- `rental`
- `emi`
- `pmi`
- `tax`
- `simulador prestamo`

Esos términos desvían la historia principal para esta audiencia.

No mezclar lenguaje de compradores como `cuota inicial`, búsqueda de inmueble o primera vivienda salvo que apoye directamente la comparación entre el crédito actual y la nueva opción.

## Estrategia de Capturas

Las dos primeras capturas deben responder rápido:

1. ¿Cuánto quedaría mi nueva cuota?
2. ¿Cuándo empieza a valer la pena refinanciar?

Orden recomendado:

1. Nueva cuota mensual
2. Punto de equilibrio del refinanciamiento
3. Crédito actual vs nueva opción
4. Diferencia en intereses totales
5. Evolución del crédito en el tiempo
6. Pagos extra después del refinanciamiento

### Copy sugerido para capturas

1. `Mira tu nueva cuota mensual`
2. `Evalúa cuándo refinanciar conviene`
3. `Compara tu crédito actual con una nueva opción`
4. `Revisa la diferencia en intereses`
5. `Entiende cómo cambia tu crédito`
6. `Prueba pagos extra después`

## Criterios de Mensaje

Esta CPP debe:

- sentirse más enfocada que la página general
- concentrarse en la decisión de refinanciar
- resaltar cuota, ahorro y punto de equilibrio antes que la lista de funciones

Esta CPP no debe:

- abrir con lenguaje de compra de vivienda
- mezclar demasiados inputs de compra
- verse como una calculadora hipotecaria genérica con refinanciamiento al final

## Deep Link

Si el routing de la app ya está listo, usar un deep link hacia la vista de refinanciamiento al configurar esta CPP.

Destino sugerido:

- vista de refinanciamiento
- o entrada directa al comparador de refinanciamiento

Si todavía no existe ese destino en la app, dejarlo pendiente por ahora.

## Métricas de Éxito

Métrica principal:

- tasa de conversión

Métricas secundarias:

- retención
- sesiones
- calidad del usuario que paga, si hay volumen suficiente

No comparar esta CPP con la de homebuyers como si hablaran al mismo público. La pregunta correcta es si el tráfico con intención de refinanciar convierte mejor aquí que en la página por defecto.

## Secuencia de Implementación

1. Crear la CPP `Refinanciamiento` en App Store Connect.
2. Aplicar el promotional text de esta guía.
3. Asignar la selección de keywords orientada a refinanciamiento.
4. Subir las capturas en el orden recomendado.
5. Agregar deep link solo si el destino dentro de la app ya está listo.
6. Lanzarla únicamente en tráfico con intención clara de refinanciar.

## Siguiente Paso

Después de armar esta CPP en App Store Connect, decidir si también hace falta una página web separada para SEO, paid traffic o campañas específicas.

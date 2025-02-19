# MUI Datatable library inspired by the gregnb/mui-datatables project, featuring an up-to-date implementation with Typescript Support

## Installation

If not already installed, install the Material-UI library:

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

Then install the mui-datatables-updated package:

```bash
npm install mui-datatables-updated
```

## Usage

```jsx
import React from 'react';
import MUIDataTable from 'mui-datatables-updated';

const sampleData = [
  {
    "id": 1,
    "name": "Cupcake",
    "carbs": 67,
  },
  {
    "id": 2,
    "name": "Donut",
    "carbs": 51,
  }
];

export default function App() {
  return (
    <>
      <MUITable title='Sample title' data={sampleData} />
    </>
  )
}
```

## Options

| Name | Type | Description |
| --- | --- | --- |
| title | string | Title of the table |
| data | array | Data to be displayed in the table |
| deactivateSelect | boolean | Disable row selection |
| defaultOrderBy | string -> must be a key in the data object | Default order by key to sort the table data on first load |
| defaultOrder | 'asc' or 'desc' | Default order to be used when sorting and displaying on first load |
| excludedColumns | array | Array of **keys** in data objects to be excluded from the table |
| columns | array | Array of objects to define the columns of the table |
| options | object | Object to define the options of the table |

### Example

```jsx
import MUITable from 'mui-datatables-updated'

const sampleColumns = [
  {
    name: 'name',
    label: 'Name of dessert',
  },
  {
    name: 'healthy',
    label: 'Is Healthy?',
    options: {
      sort: false,
      customBodyRender: (value: boolean) => value ? ':)' : ':('
    }
  },
  {
    name: 'carbs',
    label: 'Carbs (g)',
    options: {
      sort: false
    }
  },
  {
    name: 'id',
    label: 'ID',
  }
]

function App() {
  return (
    <>
      <h1>MUI Table test</h1>
      <MUITable
        title='Sample Test'
        data={sampleData}
        defaultOrder='desc'
        defaultOrderBy='name'
        excludedColumns={['id']}
      />
      <MUITable
        title='Sample Test'
        data={sampleData}
        defaultOrder='desc'
        defaultOrderBy='name'
        columns={sampleColumns}
        deactivateSelect
        options={{
          translations: {
            filterTooltip: 'Filtrar',
            filtersTitle: 'Filtros',
            resetButtonText: 'Reiniciar',
            searchPlaceholder: 'Buscar...',
            rowsPerPageText: 'Filas por página',
            selectedTextRenderer: (numSelected) => `${numSelected} seleccionado/s`,
            labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count}`,
          }
        }}
      />
    </>
  )
}
```

## Custom Columns

On each column object, you have the ability to customize columns to show the filtering options in the filter dropdown and to disable sorting when clicking on the column header. Values are set to true by default.

| Name | Type | Description |
| --- | --- | --- |
| name | string | Key in the data object |
| label | string | Label to be displayed in the column header |
| options | object | Object to define the options of the column |

### Options Object

| Name | Type | Description |
| --- | --- | --- |
| customBodyRender | function | Function to render custom content in the column |
| filter | boolean | Show filter dropdown in the column |
| sort | boolean | Enable sorting when clicking on the column header |

### Custom columns example

```jsx
const columns = [
 {
  name: "active",
  label: "Is Active",
  options: {
    customBodyRender: (value: boolean) => value ? 'Yes' : 'No',
    filter: true,
    sort: false
  }
 },
 ...
];
```

## Localization

As well as gregnb original package, I decided that the cost of bringing in another library to perform localizations would be too expensive. Instead the ability to override most text labels (which aren't many) is offered through the translations property. The available customizations are:

```jsx
<MUITable
  title='Sample Test'
  data={sampleData}
  options={{
    translations: {
      filterTooltip: 'Filtrar',
      filtersTitle: 'Filtros',
      resetButtonText: 'Reiniciar',
      searchPlaceholder: 'Buscar...',
      rowsPerPageText: 'Filas por página',
      selectedTextRenderer: (numSelected) => `${numSelected} seleccionado/s`,
      labelDisplayedRows: ({ from, to, count }) => `${from}-${to} de ${count}`,
    }
  }}
/>
```

## Contributing

Pull requests are welcome. I won't be able to implement new features in the short term, so feel free to contribute to the project by adding new features, fixing bugs, creating tests, and improving the documentation.

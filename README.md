# MUI Datatable library inspired by the gregnb/mui-datatables project, featuring an up-to-date implementation with Typescript Support

## Installation

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
| defaultOrderBy | string -> must be a key in the data object | Default order by key to be used |
| defaultOrder | 'asc' or 'desc' | Default order to be used |
| excludedColumns | array | Array of keys to be excluded from the table |

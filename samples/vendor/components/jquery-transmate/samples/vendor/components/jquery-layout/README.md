jquery-layout
=============

> A simple interface for common layout tasks. 


Basic Usage
-----------

```html
<div class="container">
  <div data-value="10"></div>
  <div data-value="10"></div>
  <div data-value="30"></div>
  <div data-value="40"></div>
  <div data-value="30"></div>
  <div data-value="20"></div>
  <div data-value="20"></div>
  <div data-value="10"></div>
  <div data-value="40"></div>
</div>
```

```js
$('.container > div').layout({
  align: 'top left', 
  sort: 'value', 
  order: 'desc', 
  stack: {
    sort: 'value', 
    offset: {
      top: 10, 
      left: 0
    }
  }
});
```

Options
-------

<table>
  <tr>
    <th>Option</th><th>Type</th><th>Description</th>
  </tr>
  <tr>
    <td>align</td>
    <td>String</td>
    <td>
      A combination of alignment values, e.g. `middle 75%`. See `textAlign` and `verticalAlign`.
    </td>
  </tr>
  <tr>
    <td>columns</td>
    <td>Number</td>
    <td>
      Specify the number of columns in each row. You can also provide a callback-function to calculate this value on the fly. Defaults to `0`.
    </td>
  </tr>
  <tr>
    <td>order</td>
    <td>String</td>
    <td>
      Specifies the order of elements when a sort-function has been provided. One out of `asc` or `desc`. Defaults to `asc`.    
    </td>
  </tr>
  <tr>
    <td>sort</td>
    <td>Function</td>
    <td>
      Allows for sorting elements. When providing a string, a sort-function is auto-generated based on the value of a data-attribute. When providing an array of elements, a function is generated based on array index
    </td>
  </tr>
  <tr>
    <td>stack</td>
    <td>Object</td>
    <td>
      Allows for stacking of elements. Provide an object with the following properties: `offset`, `sort`, `align`, `textAlign`, verticalAlign`. You can also provide a string containing alignment-values separated by whitespace. By default, stacking is based on the value of the sort-param. Alignment defaults to `bottom center`. You can specify an offset at which elements are stacked. Defaults to `auto` which means based on the element's height. 
    </td>
  </tr>
  <tr>
    <td>style</td>
    <td>String</td>
    <td>
      One out of `absolute`, `transform` or `none`. Defaults to `absolute`.
    </td>
  </tr>
  <tr>
    <td>textAlign</td>
    <td>String</td>
    <td>
      One out of `left`, `center`, `bottom`. This value can also be specified as percent unit, e.g. `75%` or as a float, e.g. `0.75`.
    </td>
  </tr>
  <tr>
    <td>verticalAlign</td>
    <td>String</td>
    <td>
      One out of `top`, `middle`, `bottom`. This value can also be specified as percent unit, e.g. `75%` or as a float, e.g. `0.75`.
    </td>
  </tr>
</table>
# Laravel-react-datatable

work in progress ...

## Pagination Params

| Name                 | Type                  | Default      | Description                                                                            |
| -------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------- |
| `enabled`            | Boolean               | true         | Enable or Disable pagination                                                           |
| `totalItemsCount`    | Number                |              | **Required.** Total count of items which you are going to display                      |
| `onChange`           | Function              |              | **Required.** Page change handler. Receive pageNumber as arg                           |
| `activePage`         | Number                | `1`          | **Required.** Active page                                                              |
| `itemsCountPerPage`  | Number                | `10`         | Count of items per page                                                                |
| `pageRangeDisplayed` | Number                | `5`          | Range of pages in paginator, exclude navigation blocks (prev, next, first, last pages) |
| `prevPageText`       | String / ReactElement | `⟨`          | Text of prev page navigation button                                                    |
| `firstPageText`      | String / ReactElement | `«`          | Text of first page navigation button                                                   |
| `lastPageText`       | String / ReactElement | `»`          | Text of last page navigation button                                                    |
| `nextPageText`       | String / ReactElement | `⟩`          | Text of next page navigation button                                                    |
| `getPageUrl`         | Function              |              | Generate href attribute for page                                                       |
| `innerClass`         | String                | `pagination` | Class name of `<ul>` tag                                                               |
| `activeClass`        | String                | `active`     | Class name of active `<li>` tag                                                        |
| `activeLinkClass`    | String                |              | Class name of active `<a>` tag                                                         |
| `itemClass`          | String                |              | Default class of the `<li>` tag                                                        |
| `itemClassFirst`     | String                |              | Class of the first `<li>` tag                                                          |
| `itemClassPrev`      | String                |              | Class of the previous `<li>` tag                                                       |
| `itemClassNext`      | String                |              | Class of the next `<li>` tag                                                           |
| `itemClassLast`      | String                |              | Class of the last `<li>` tag                                                           |
| `disabledClass`      | String                | `disabled`   | Class name of the first, previous, next and last `<li>` tags when disabled             |
| `hideDisabled`       | Boolean               | `false`      | Hide navigation buttons (prev, next, first, last) if they are disabled.                |
| `hideNavigation`     | Boolean               | `false`      | Hide navigation buttons (prev page, next page)                                         |
| `hideFirstLastPages` | Boolean               | `false`      | Hide first/last navigation buttons                                                     |
| `linkClass`          | String                |              | Default class of the `<a>` tag                                                         |
| `linkClassFirst`     | String                |              | Class of the first `<a>` tag                                                           |
| `linkClassPrev`      | String                |              | Class of the previous `<a>` tag                                                        |
| `linkClassNext`      | String                |              | Class of the next `<a>` tag                                                            |
| `linkClassLast`      | String                |              | Class of the last `<a>` tag                                                            |

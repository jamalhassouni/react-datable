import React from "react";
import ReactDOM from "react-dom";
import "./datatable.css";
import Pagination from "../Pagination";
import PropTypes from "prop-types";
import Utils, { isEmpty } from "../utils";
import cx from "classnames";
const isEqual = require("react-fast-compare");

export default class DataTable extends React.Component {
  _preSearchData = null;
  static defaultProps = {
    searchable: true,
    pagination: {
      enabled: true,
      position: ["bottom left", "top left"],
      currentPage: 1,
      itemsCountPerPage: 10,
      pageRangeDisplayed: 5,
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      headers: props.headers,
      data: props.data,
      pagedData: props.data,
      _preSearchData: props.data,
      sortby: null,
      Startsorting: false,
      descending: null,
      search: false,
      itemsCountPerPage: props.pagination.itemsCountPerPage,
      currentPage: props.pagination.currentPage,
    };

    this.keyField = props.keyField || "id"; // TODO: revisit this logic
    this.noData = props.noData || "No records found!";
    this.width = props.width || "100%";

    // Add pagination support
    this.pagination =
      (!isEmpty(this.props.pagination) && this.props.pagination) ||
      DataTable.defaultProps.pagination; //{ enabled: true };
  }

  /**
   * Render Table Header Title
   */
  renderTableHeaderTitle = (
    title,
    cleanTitle,
    index,
    sortIcon = null,
    style
  ) => {
    if (typeof title === "object") {
      const icon = React.createElement(
        "span",
        {
          "data-col": cleanTitle,
          "data-index": index,
          key: "icon",
          style: {
            cursor: "pointer",
          },
        },
        sortIcon
      );
      const childrenWithProps = React.Children.map(
        title.props.children,
        (child, i) => {
          if (typeof child === "object") {
            return React.cloneElement(child, {
              "data-col": cleanTitle,
              "data-index": index,
            });
          } else {
            return child;
          }
        }
      );
      const titleElement = React.cloneElement(
        title,
        {
          "data-col": cleanTitle,
          "data-index": index,
          className: "header-cell",
          key: "title-custom" + index,
          style,
        },
        [childrenWithProps]
      );
      return React.cloneElement(
        <div style={{ display: "flex" }} />,
        {
          "data-col": cleanTitle,
          "data-index": index,
          className: "header-cell",
        },
        [titleElement, icon]
      );
    } else {
      if (sortIcon) {
        return (
          <span
            draggable
            data-col={cleanTitle}
            data-index={index}
            className="header-cell"
            style={style}
          >
            {title} {sortIcon}
          </span>
        );
      } else {
        return (
          <span
            draggable
            data-col={cleanTitle}
            data-index={index}
            className="header-cell"
            style={style}
          >
            {title}
          </span>
        );
      }
    }
  };
  /**
   * Render Table Header
   */
  renderTableHeader = () => {
    let { headers } = this.state;
    headers.sort((a, b) => {
      if (a.index > b.index) return 1;
      return -1;
    });
    let sortIcon = null;

    let headerView = headers.map((header, index) => {
      let title = header.title;
      let cleanTitle =
        typeof header.accessor === "function"
          ? typeof header.title === "object"
            ? Utils.onlyText(header.title.props.children)
            : header.title
          : header.accessor;
      let width = header.width;

      if (this.state.sortby === index) {
        // title += this.state.descending ? "\u2193" : "\u2191";
        sortIcon = this.state.descending ? "  ▾" : "  ▴";
      } else {
        sortIcon = null;
      }

      return (
        <th
          key={cleanTitle + index}
          ref={(th) => (this[cleanTitle] = th)}
          style={{ width: width + "px" }}
          data-col={cleanTitle}
          data-index={index}
        >
          {this.renderTableHeaderTitle(
            title,
            cleanTitle,
            index,
            sortIcon,
            header.style
          )}
        </th>
      );
    });

    return headerView;
  };

  /**
   * Render No Data Found
   */
  renderNoData = () => {
    return (
      <tr>
        <td colSpan={this.props.headers.length}>{this.noData}</td>
      </tr>
    );
  };

  /**
   * on Update table Content
   */
  onUpdate = (e) => {
    e.preventDefault();
    let input = e.target.firstChild;
    let header = this.state.headers[this.state.edit.cell];
    let rowId = this.state.edit.rowId;

    this.setState({
      edit: null,
    });

    this.props.onUpdate &&
      this.props.onUpdate(header.accessor, Number(rowId), input.value);
  };
  /**
   * Handle Form Reset
   */
  onFormReset = (e) => {
    if (e.keyCode === 27) {
      // ESC key
      this.setState({
        edit: null,
      });
    }
  };

  /**
   * Render Table Content
   */
  renderContent = () => {
    let { headers } = this.state;
    let data = this.state.data;

    let contentView = data.map((row, rowIdx) => {
      let id = row[this.keyField];
      let edit = this.state.edit;

      let tds = headers.map((header, index) => {
        let content = "";
        if (typeof header.accessor === "function") {
          content = header.accessor(row);
        } else {
          if (header.accessor.includes(".")) {
            let splitedcolAccessor = header.accessor.split(".");
            splitedcolAccessor.forEach((title, index) => {
              if (index === 0) {
                content = row[title];
              } else {
                content = content[title];
              }
            });
          } else {
            content = row[header.accessor];
          }
        }
        let cell = header.cell;
        if (cell) {
          if (typeof cell === "object") {
            if (cell.type === "image" && content) {
              content = <img style={cell.style} src={content} alt="" />;
            }
          } else if (typeof cell === "function") {
            content = cell(row, index);
          }
        }

        if (this.props.edit) {
          if (
            header.dataType &&
            (header.dataType === "number" || header.dataType === "string") &&
            header.accessor !== this.keyField
          ) {
            if (edit && edit.row === rowIdx && edit.cell === index) {
              content = (
                <form onSubmit={this.onUpdate}>
                  <input
                    type="text"
                    defaultValue={content}
                    onKeyUp={this.onFormReset}
                  />
                </form>
              );
            }
          }
        }

        return (
          <td key={index} data-id={id} data-row={rowIdx}>
            {content}
          </td>
        );
      });
      return <tr key={rowIdx}>{tds}</tr>;
    });
    return contentView;
  };

  /**
   * Handle Sort Data
   */
  onSort = (e) => {
    let data = this.state.data.slice(); // Give new array
    let colIndex = Number(ReactDOM.findDOMNode(e.target).dataset.index);
    let colAccessor = this.state.headers[colIndex].accessor;
    let sortable = this.state.headers[colIndex].sortable;
    if (!sortable) {
      return;
    }
    let descending = !this.state.descending;

    data.sort((a, b) => {
      let sortVal = 0;
      let aValue = "",
        bValue = "";
      if (typeof colAccessor === "function") {
        aValue = colAccessor(a);
        bValue = colAccessor(b);
        if (!isEmpty(aValue) && typeof aValue === "object") {
          aValue = Utils.onlyText(aValue.props.children);
          bValue = Utils.onlyText(bValue.props.children);
        }
      } else {
        if (colAccessor.includes(".")) {
          let splitedcolAccessor = colAccessor.split(".");
          splitedcolAccessor.forEach((title, index) => {
            if (index === 0) {
              aValue = a[title];
              bValue = b[title];
            } else {
              aValue = aValue[title];
              bValue = bValue[title];
            }
          });
        } else {
          aValue = a[colAccessor];
          bValue = b[colAccessor];
        }
      }
      aValue = typeof aValue === "string" ? aValue.toLowerCase() : aValue;
      bValue = typeof bValue === "string" ? bValue.toLowerCase() : bValue;
      if (aValue < bValue) {
        sortVal = -1;
      } else if (aValue > bValue) {
        sortVal = 1;
      }
      if (descending) {
        sortVal = sortVal * -1;
      }
      return sortVal;
    });

    this.setState({
      data,
      sortby: colIndex,
      Startsorting: true,
      descending,
    });
  };

  /**
   * Handle Search
   */
  onSearch = (e) => {
    let { headers } = this.state;
    // Grab the index of the target column
    let idx = e.target.dataset.idx;
    let fieldName = "",
      fieldValue = "",
      inputId = "";

    // Get the target column
    fieldName = headers[idx].accessor;

    let data = this._preSearchData;

    // Filter the records
    let searchData = this.state._preSearchData.filter((row) => {
      if (typeof fieldName === "function") {
        fieldValue = fieldName(row);
        if (!isEmpty(fieldValue) && typeof fieldValue === "object") {
          fieldValue = Utils.onlyText(fieldValue.props.children);
        }
        if (typeof headers[idx].title === "object") {
          inputId =
            "inp" +
            Utils.onlyText(headers[idx].title.props.children).replace(
              /\s/g,
              ""
            );
        } else {
          inputId = "inp" + headers[idx].title.replace(/\s/g, "");
        }
      } else {
        if (fieldName.includes(".")) {
          let splitedcolAccessor = fieldName.split(".");
          splitedcolAccessor.forEach((title, index) => {
            if (index === 0) {
              fieldValue = row[title];
            } else {
              fieldValue = fieldValue[title];
            }
          });
        } else {
          fieldValue = row[fieldName];
        }

        inputId = "inp" + fieldName;
      }
      let input = this[inputId];
      if (isEmpty(input.value)) {
        return true;
      }

      if (!isEmpty(fieldValue) || (isEmpty(fieldValue) && fieldValue == 0)) {
        return (
          fieldValue
            .toString()
            .toLowerCase()
            .indexOf(input.value.toString().toLowerCase()) !== -1
        );
      }
    });

    //UPdate the state
    this.setState(
      {
        data: searchData,
        pagedData: searchData,
        search: this.props.searchable,
        totalItemsCount: searchData.length,
      },
      () => {
        if (this.pagination.enabled) {
          //this.onGotoPage(1);
        }
      }
    );
  };

  /**
   * Render Search Inputs
   */
  renderSearch = () => {
    let { search, headers } = this.state;
    let { searchable } = this.props;
    if (!searchable) {
      return <td key="emptytr1"></td>;
    }

    let searchInputs = headers.map((header, idx) => {
      if (!header.searchable) {
        return <td key={`emptytr${idx}`}></td>;
      }
      // Get the header ref.
      let hdr = this[header.accessor];
      let inputId = "";
      if (typeof header.accessor === "function") {
        if (typeof header.title === "object") {
          inputId =
            "inp" +
            Utils.onlyText(header.title.props.children).replace(/\s/g, "");
        } else {
          inputId = "inp" + header.title.replace(/\s/g, "");
        }
      } else {
        inputId = "inp" + header.accessor;
      }

      return (
        <td key={idx}>
          <input
            type="text"
            ref={(input) => (this[inputId] = input)}
            style={{
              //width: hdr && hdr.clientWidth - 17 + "px",
              width: header.width - 17 + "px",
            }}
            data-idx={idx}
          />
        </td>
      );
    });

    return <tr onChange={this.onSearch}>{searchInputs}</tr>;
  };

  onShowEditor = (e) => {
    let id = e.target.dataset.id;
    this.setState({
      edit: {
        row: parseInt(e.target.dataset.row, 10),
        rowId: id,
        cell: e.target.cellIndex,
      },
    });
  };

  /**
   * Render Table
   */
  renderTable = () => {
    let title = this.props.title || "DataTable";
    let headerView = this.renderTableHeader();
    let contentView =
      this.state.data && this.state.data.length > 0
        ? this.renderContent()
        : this.renderNoData();

    return (
      <table className="data-inner-table">
        {/* <caption className="data-table-caption">{title}</caption> */}
        <thead onClick={this.onSort}>
          <tr>{headerView}</tr>
        </thead>

        {
          //TODO: fix edit
          /* <tbody onDoubleClick={this.onShowEditor} >
          {this.renderSearch()}
          {contentView}
        </tbody> */
        }
        <tbody>
          {this.renderSearch()}
          {contentView}
        </tbody>
      </table>
    );
  };

  onitemsCountPerPageChange = (itemsCountPerPage) => {
    this.setState(
      {
        itemsCountPerPage: parseInt(itemsCountPerPage, 10),
      },
      () => {
        this.onGotoPage(this.state.currentPage);
      }
    );
  };

  onGotoPage = (pageNo) => {
    this.setState(
      {
        currentPage: pageNo,
        search: false,
        Startsorting: false,
        sortby: null,
      },
      () => this.props.pagination.onPageChange(pageNo)
    );
  };

  static getDerivedStateFromProps = (nextProps, prevState) => {
    // eslint-disable-next-line
    if (
      !isEqual(nextProps.data, prevState.data) &&
      !prevState.Startsorting &&
      !prevState.search
    ) {
      return {
        headers: nextProps.headers,
        data: nextProps.data,
        sortby: prevState.sortby,
        descending: prevState.descending,
        //search: prevState.search,
        pagedData: nextProps.data,
        _preSearchData: nextProps.data,
      };
    }
    return {
      Startsorting: false,
    };
  };

  render() {
    return (
      <div className={cx(this.props.className, "data-table")}>
        {this.pagination.enabled &&
          this.pagination.position.join(", ").includes("top") && (
            <Pagination
              activePage={this.state.currentPage}
              itemsCountPerPage={this.props.pagination.itemsCountPerPage}
              totalItemsCount={this.props.totalItemsCount}
              onChange={this.onGotoPage.bind(this)}
              pageRangeDisplayed={this.props.pagination.pageRangeDisplayed}
              position={
                this.pagination.position[0].includes("top")
                  ? this.pagination.position[0]
                  : this.pagination.position[1]
              }
              innerClass={cx(this.props.pagination.innerClass, "pagination")}
              activeClass={
                this.props.pagination.activeClass
                  ? this.props.pagination.activeClass
                  : "active"
              }
              disabledClass={cx(this.props.pagination.innerClass, "disabled")}
              itemClass={this.props.pagination.itemClass}
              itemClassFirst={this.props.pagination.itemClassFirst}
              itemClassPrev={this.props.pagination.itemClassPrev}
              itemClassNext={this.props.pagination.itemClassNext}
              itemClassLast={this.props.pagination.itemClassLast}
              activeLinkClass={this.props.pagination.activeLinkClass}
              disabledClass={this.props.pagination.disabledClass}
              prevPageText={this.props.pagination.prevPageText}
              firstPageText={this.pagination.firstPageText}
              lastPageText={this.props.pagination.lastPageText}
              nextPageText={this.props.pagination.nextPageText}
              getPageUrl={this.props.pagination.getPageUrl}
              activeLinkClass={this.props.pagination.activeLinkClass}
              hideDisabled={this.props.pagination.hideDisabled}
              hideNavigation={this.props.pagination.hideNavigation}
              hideFirstLastPages={this.props.pagination.hideFirstLastPages}
              linkClass={this.props.pagination.linkClass}
              linkClassFirst={this.props.pagination.linkClassFirst}
              linkClassPrev={this.props.pagination.linkClassPrev}
              linkClassNext={this.props.pagination.linkClassNext}
              linkClassLast={this.props.pagination.linkClassLast}
            />
          )}
        {this.renderTable()}
        {this.pagination.enabled &&
          this.pagination.position.join(", ").includes("bottom") && (
            <Pagination
              activePage={this.state.currentPage}
              itemsCountPerPage={this.props.pagination.itemsCountPerPage}
              totalItemsCount={this.props.totalItemsCount}
              onChange={this.onGotoPage.bind(this)}
              pageRangeDisplayed={this.props.pagination.pageRangeDisplayed}
              position={
                this.pagination.position[0].includes("bottom")
                  ? this.pagination.position[0]
                  : this.pagination.position[1]
              }
              innerClass={cx(this.props.pagination.innerClass, "pagination")}
              activeClass={
                this.props.pagination.activeClass
                  ? this.props.pagination.activeClass
                  : "active"
              }
              disabledClass={cx(this.props.pagination.innerClass, "disabled")}
              itemClass={this.props.pagination.itemClass}
              itemClassFirst={this.props.pagination.itemClassFirst}
              itemClassPrev={this.props.pagination.itemClassPrev}
              itemClassNext={this.props.pagination.itemClassNext}
              itemClassLast={this.props.pagination.itemClassLast}
              activeLinkClass={this.props.pagination.activeLinkClass}
              disabledClass={this.props.pagination.disabledClass}
              prevPageText={this.props.pagination.prevPageText}
              firstPageText={this.pagination.firstPageText}
              lastPageText={this.props.pagination.lastPageText}
              nextPageText={this.props.pagination.nextPageText}
              getPageUrl={this.props.pagination.getPageUrl}
              activeLinkClass={this.props.pagination.activeLinkClass}
              hideDisabled={this.props.pagination.hideDisabled}
              hideNavigation={this.props.pagination.hideNavigation}
              hideFirstLastPages={this.props.pagination.hideFirstLastPages}
              linkClass={this.props.pagination.linkClass}
              linkClassFirst={this.props.pagination.linkClassFirst}
              linkClassPrev={this.props.pagination.linkClassPrev}
              linkClassNext={this.props.pagination.linkClassNext}
              linkClassLast={this.props.pagination.linkClassLast}
            />
          )}
      </div>
    );
  }
}

DataTable.propTypes = {
  edit: PropTypes.bool,
  width: PropTypes.string,
  headers: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.array.isRequired,
  noData: PropTypes.string,
  onUpdate: PropTypes.func,
  totalItemsCount: PropTypes.number.isRequired,
  searchable: PropTypes.bool,
  pagination: PropTypes.shape({
    enabled: PropTypes.bool,
    currentPage: PropTypes.number.isRequired,
    itemsCountPerPage: function (props, propName, componentName) {
      // eslint-disable-next-line
      if (
        // eslint-disable-next-line
        props["enabled"] == true &&
        // eslint-disable-next-line
        (props[propName] == undefined || typeof props[propName] != "number")
      ) {
        const error = console.error;
        console.error = function (warning, ...args) {
          if (
            /Please provide itemsCountPerPage paginate Proprty/.test(warning)
          ) {
            throw new Error(warning);
          }
          error.apply(console, [warning, ...args]);
        };
        throw new Error("Please provide itemsCountPerPage paginate Proprty");
      }
    },
    position: function (props, propName, componentName) {
      // eslint-disable-next-line
      if (
        // eslint-disable-next-line
        props["enabled"] == true &&
        // eslint-disable-next-line
        (props[propName] == undefined || !Array.isArray(props[propName]))
      ) {
        const error = console.error;
        console.error = function (warning, ...args) {
          if (
            /Please provide paginate position Property with type array/.test(
              warning
            )
          ) {
            throw new Error(warning);
          }
          error.apply(console, [warning, ...args]);
        };
        throw new Error(
          "Please provide paginate position Property with type array"
        );
      }
    },
    pageRangeDisplayed: PropTypes.number,
    onPageChange: PropTypes.func.isRequired,
  }),
};

import React from "react";
import ReactDOM from "react-dom";
import "./datatable.css";
import Pagination from "../Pagination";
import PropTypes from "prop-types";
import Utils, { isEmpty } from "../../utils";
const isEqual = require("react-fast-compare");

export default class DataTable extends React.Component {
  _preSearchData = null;
  static defaultProps = {
    currentPage: 1,
    totalRecords: 5,
    searchable: true,
    pagination: {
      enabled: true,
      pageLength: 5,
      type: "long", // long, short
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
      pageLength: props.pagination.pageLength,
      currentPage: 1,
    };

    this.keyField = props.keyField || "id"; // TODO: revisit this logic
    this.noData = props.noData || "No records found!";
    this.width = props.width || "100%";

    // Add pagination support
    this.pagination = (!isEmpty(this.props.pagination) &&
      this.props.pagination) || { enabled: true };
  }

  /**
   * Render Table Header
   */
  renderTableHeader = () => {
    let { headers } = this.state;
    headers.sort((a, b) => {
      if (a.index > b.index) return 1;
      return -1;
    });

    let headerView = headers.map((header, index) => {
      let title = header.title;
      let cleanTitle =
        typeof header.accessor === "function" ? header.title : header.accessor;
      let width = header.width;

      if (this.state.sortby === index) {
        // title += this.state.descending ? "\u2193" : "\u2191";
        title += this.state.descending ? "  ▾" : "  ▴";
      }

      return (
        <th
          key={cleanTitle}
          ref={(th) => (this[cleanTitle] = th)}
          style={{ width: width + "px" }}
          data-col={cleanTitle}
          data-index={index}
        >
          <span
            draggable
            data-col={cleanTitle}
            data-index={index}
            className="header-cell"
          >
            {title}
          </span>
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
            content = cell(row);
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

    console.log("data", data);
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
        inputId = "inp" + headers[idx].title.replace(/\s/g, "");
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
        console.log("fieldValue", fieldValue);
        console.log("input.value", input.value);
        return (
          fieldValue
            .toString()
            .toLowerCase()
            .indexOf(input.value.toString().toLowerCase()) !== -1
        );
      }
    });

    console.log("searchData", searchData);

    //UPdate the state
    this.setState(
      {
        data: searchData,
        pagedData: searchData,
        search: this.props.searchable,
        totalRecords: searchData.length,
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
        inputId = "inp" + header.title.replace(/\s/g, "");
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

  onPageLengthChange = (pageLength) => {
    this.setState(
      {
        pageLength: parseInt(pageLength, 10),
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
      () => this.props.onPageChange(pageNo)
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
      <div className={this.props.className}>
        {this.pagination.enabled && (
          <Pagination
            // type={this.props.pagination.type}
            //totalRecords={this.props.totalRecords}
            //pageLength={this.props.pagination.pageLength}
            //onPageLengthChange={this.onPageLengthChange}
            //onGotoPage={this.onGotoPage}
            //currentPage={this.state.currentPage}
            activePage={this.state.currentPage}
            itemsCountPerPage={this.props.pagination.pageLength}
            totalItemsCount={this.props.totalRecords}
            onChange={this.onGotoPage.bind(this)}
            pageRangeDisplayed={5}
            position={"left"}
            //itemClass="item"
            //innerClass=""
            //activeClass="active"
            //activeLinkClass="active"
            //disabledClass="disabled item"
          />
        )}
        {this.renderTable()}
        {this.pagination.enabled && (
          <Pagination
            // type={this.props.pagination.type}
            //totalRecords={this.props.totalRecords}
            //pageLength={this.props.pagination.pageLength}
            //onPageLengthChange={this.onPageLengthChange}
            //onGotoPage={this.onGotoPage}
            //currentPage={this.state.currentPage}
            activePage={this.state.currentPage}
            itemsCountPerPage={this.props.pagination.pageLength}
            totalItemsCount={this.props.totalRecords}
            onChange={this.onGotoPage.bind(this)}
            pageRangeDisplayed={5}
            position={"right"}
            //itemClass="item"
            //innerClass=""
            //activeClass="active"
            //activeLinkClass="active"
            //disabledClass="disabled item"
          />
        )}
      </div>
    );
  }
}

DataTable.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
  pagination: PropTypes.shape({
    enabled: PropTypes.bool,
    pageLength: function (props, propName, componentName) {
      // eslint-disable-next-line
      if (
        // eslint-disable-next-line
        props["enabled"] == true &&
        // eslint-disable-next-line
        (props[propName] == undefined || typeof props[propName] != "number")
      ) {
        throw new Error("Please provide pageLength paginate Proprty");
      }
    },
    type: PropTypes.string,
  }),
  onPageChange: PropTypes.func.isRequired,
  pageRangeDisplayed: PropTypes.number,
};

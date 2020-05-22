import React, { Component } from "react";
import "./App.css";
import DataTable from "./Components/DataTable";
import fetch from "isomorphic-unfetch";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      headers: [
        //{title:"Id",accessor: "id", index: 0, dataType: "number"},

        { title: "#", accessor: "id", index: 1, dataType: "number" },
        {
          title: "First Name",
          accessor: "first_name",
          width: "200",
          index: 2,
          searchable: true,
          dataType: "string",
        },
        {
          title: "Last Name",
          searchable: true,
          accessor: (d) => d.last_name,
          width: "300",
          index: 3,
          dataType: "function",
        },
        {
          title: "username",
          // accessor: "username",
          accessor: (d) => (
            <span>
              name <i>{d.username}</i>
              <a href="#"> link</a>
            </span>
          ),
          width: "300",
          index: 5,
          searchable: true,
          dataType: "function",
        },
        {
          title: "rate",
          searchable: true,
          accessor: "doctor.average",

          width: "300",
          index: 6,
        },
        {
          title: "Rating",
          accessor: "doctor.avg_rate",
          searchable: true,
          index: 7,
          width: "200",
          cell: (row) => {
            return (
              <div className="rating">
                <div
                  style={{
                    backgroundColor: "lightskyblue",
                    textAlign: "center",
                    height: "1.9em",
                    width: (row.doctor.avg_rate / 5) * 201 + "px",
                    margin: "3px 0 4px 0",
                  }}
                >
                  <a href={`/showchart/${row.id}`}>{row.doctor.avg_rate}</a>
                </div>
              </div>
            );
          },
        },
      ],
      data: [],
      current_page: 1,
      last_page_url: null,
      next_page_url: null,
      per_page: 5,
      totalRecords: 5,
      from: null,
      to: null,
    };
  }

  //TODO: fix update for custom accessor
  onUpdateTable = (field, id, value) => {
    console.log(field, id, value);
    let data = this.state.data.slice();
    let updateRow = this.state.data.find((d) => {
      return d["id"] === id;
    });

    console.log("updateRow", updateRow);

    updateRow[field] = value;

    this.setState({
      edit: null,
      data: data,
    });
  };

  /**
   * search For Doctors by specility | name | country | city | gender | price | rating
   *
   *  @param {object} values
   *  @param {string} url
   *  @param {number} pageNumber
   *  @return {array} data
   */
  search = async (pageNumber = 1) => {
    let baseApiURL = "http://localhost:8000/api";
    try {
      let searchURL = `${baseApiURL}/search?page=${pageNumber}`;
      const response = await fetch(searchURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Requested-With": "XMLHttpRequest",
        },
        //body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.error === false) {
        return data.data;
      } else {
        return {};
      }
    } catch (err) {
      console.error("error", err);
    }
  };
  async componentDidMount() {
    let res = await this.search();
    //console.log("res.per_page", res.per_page);
    this.setState({
      data: res.data,
      current_page: res.current_page,
      last_page_url: res.last_page_url,
      next_page_url: res.next_page_url,
      per_page: res.per_page,
      totalRecords: res.total,
      from: res.from,
      to: res.to,
    });
  }

  /***
   * Handle Page Change
   */
  handlePageChange = async (pageNumber) => {
    //console.log("handlePageChange", pageNumber);
    let res = await this.search(pageNumber);
    this.setState({
      data: res.data,
      current_page: pageNumber,
    });
  };
  render() {
    // console.log("state per_page", this.state.per_page);
    const pagination = {
      //enabled: true,
      //pageLength: this.state.per_page,
      //type: "long", // long, short
    };
    return (
      <div>
        <DataTable
          className="data-table"
          title="USER PROFILES"
          keyField="id"
          edit={true}
          pagination={pagination}
          width="100%"
          headers={this.state.headers}
          data={this.state.data}
          noData="No records!"
          onUpdate={this.onUpdateTable}
          currentPage={this.state.current_page}
          totalRecords={this.state.totalRecords}
          pageRangeDisplayed={5}
          onPageChange={this.handlePageChange}
          //searchable
        />
      </div>
    );
  }
}

export default App;

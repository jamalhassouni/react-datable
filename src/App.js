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
          width: "300px",
          index: 2,
          dataType: "string",
        },
        {
          title: "Last Name",
          accessor: "last_name",
          width: "300px",
          index: 3,
          dataType: "string",
        },
        {
          title: "username",
          accessor: "username",
          index: 5,
          dataType: "string",
        },
        {
          title: "Rating",
          accessor: "rating",
          index: 6,
          width: "200px",
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
      totalRecords: null,
      from: null,
      to: null,
    };
  }

  onUpdateTable = (field, id, value) => {
    let data = this.state.data.slice();
    let updateRow = this.state.data.find((d) => {
      return d["id"] === id;
    });

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
  search = async (values, url = null, pageNumber = null) => {
    let baseApiURL = "http://localhost:8000/api";
    try {
      let searchURL;
      if (url && pageNumber) {
        searchURL = `${url}?page=${pageNumber}`;
      } else {
        searchURL = `${baseApiURL}/search`;
      }
      const response = await fetch(searchURL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.error === false) {
        console.log("data", data);

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

  render() {
    console.log("state per_page", this.state.per_page);
    const pagination = {
      enabled: true,
      pageLength: this.state.per_page,
      type: "long", // long, short
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
          //totalRecords={20}
        />
      </div>
    );
  }
}

export default App;

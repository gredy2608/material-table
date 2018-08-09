import * as React from 'react'
import PropTypes from 'prop-types';
import MTableToolbar from './m-table-toolbar'
import MTablePagination from './m-table-pagination'
import {
  Checkbox, Paper, Table,
  TableHead, TableBody, TableRow,
  TableCell, TableFooter, TablePagination, 
  withStyles
} from '@material-ui/core'

class MaterialTable extends React.Component {
  constructor(props) {
    super(props);         

    const data =  this.props.data.map((row, index) => { 
      row.tableData = { id: index };
      return row;
    });
    data = getRenderData(data);

    const calculatedProps = {...this.props}
    calculatedProps.options.paging = calculatedProps.options.paging !== false 
      && Object.assign(MaterialTable.defaultProps.options.paging, calculatedProps.options.paging);



    this.state = {
      columns: this.props.columns,
      currentPage: 0,
      data: data,
      props: calculatedProps,      
      selectedCount: 0
    }
  }

  getRenderData() {
    const data = this.state.data;
    if(this.state.props.options.paging) {
      data = data.splice(this.state.currentPage * this.state.props.options.paging.pageSize, this.state.props.options.paging.pageSize)
    }

    return data;
  }

  renderHeader() {
    return (
      <TableHead>
        <TableRow>
          {this.state.props.options.selection &&
            <TableCell padding="checkbox">
              <Checkbox 
                indeterminate={this.state.selectedCount > 0 && this.state.selectedCount < this.state.data.length}
                checked={this.state.selectedCount === this.state.data.length}
                onChange={(event, checked) => {
                  const data = this.state.data.map(row => { 
                    row.tableData.checked = checked; 
                    return row;
                  });
                  const selectedCount = checked ? data.length : 0;
                  this.setState({data, selectedCount});
                }} 
              />
            </TableCell>
          }
          {this.state.columns.filter(columnDef => {return !columnDef.hidden}).map(columnDef => (
            <TableCell numeric={columnDef.isNumeric}>{columnDef.title}</TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  renderBody() {
    return (
      <TableBody>
        {this.state.data.map(data => (this.renderRow(data)))}        
      </TableBody>
    );
  }

  renderRow(data) {
    return (
      <TableRow>
        {this.state.props.options.selection &&
          <TableCell padding="checkbox">
            <Checkbox 
              checked={data.tableData.checked === true}
              value={data.tableData.id}
              onChange={(event, checked) => {
                data = this.state.data;
                data[event.target.value].tableData.checked = checked;
                this.setState(state => ({
                  data: data,
                  selectedCount: state.selectedCount + (checked ? 1 : -1)
                }))
              }}
            />
          </TableCell>
        }
        {this.state.columns.filter(columnDef => {return !columnDef.hidden}).map(columnDef => {
          const value = data[columnDef.field];
          return <TableCell numeric={columnDef.isNumeric}>{value}</TableCell>
        })}
      </TableRow>
    );
  }

  render() {
    const { classes } = this.state.props;

    return (
      <Paper className={classes.root}>
        {this.state.props.options.toolbar && 
          <MTableToolbar 
            {...this.state.props.options.toolbar} 
            columns={this.state.columns}
            onColumnsChanged={columns => this.setState({columns})}
          />
        }
        <Table className={classes.table}>
          {this.renderHeader()}
          {this.renderBody()}
        </Table>        
        {this.state.props.options.paging &&  
          <TableFooter>
            <TableRow>
              <TablePagination
                style={{position: 'absolute', right: 20}}
                colSpan={3}
                count={this.state.data.length}
                rowsPerPage={this.state.props.options.paging.pageSize}
                page={this.state.currentPage}
                onChangePage={(event, page) => { this.setState({currentPage: page}); }}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                ActionsComponent={MTablePagination}
              />
            </TableRow>
          </TableFooter>          
        }
      </Paper>
    );
  }
}

MaterialTable.defaultProps = {
  classes: {},
  columns: [],
  data: [],  
  options: {
    paging: {
      pageSize: 5,
      showPageSizeOptions: true,
      pageSizeOptions: [5, 10, 20, -1],
      showFirstButton: true,
      showLastButton: true      
    },
    selection: false,            
    toolbar: false,
  }
}

MaterialTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  options: PropTypes.object
}

const styles = theme => ({
  root: {
    margin: theme.spacing.unit,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});

export default withStyles(styles)(MaterialTable)
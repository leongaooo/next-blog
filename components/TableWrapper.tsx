const TableWrapper = ({ children }) => {
  return (
    <div className="table-scroll">
      <div className="w-full overflow-x-auto">
        <table>{children}</table>
      </div>
    </div>
  )
}

export default TableWrapper

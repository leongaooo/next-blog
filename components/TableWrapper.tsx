/* eslint-disable jsx-a11y/no-noninteractive-tabindex -- 横向滚动容器需要键盘焦点 */
const TableWrapper = ({ children }) => {
  return (
    <div className="table-scroll">
      {/* 横向滚动区域必须可聚焦，键盘才能用方向键滚动；这是 WCAG 的滚动容器例外 */}
      <div
        className="table-scroll-body w-full overflow-x-auto"
        role="region"
        aria-label="表格内容，可横向滚动"
        tabIndex={0}
      >
        <table>{children}</table>
      </div>
    </div>
  )
}

export default TableWrapper

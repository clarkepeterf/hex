
function Hex({ row, column, color, turn, winner, onClickCallback }) {

    const style = {
        backgroundColor: color,
        color: "black"
    }

    function handleClick() {
        if (!winner && (color === "rgb(252, 242, 255)" || turn === 1)) {
            onClickCallback(row, column);
        }
    }
    return (
        <div className="hex">
            <div className="hexIn">
                <div className="hexLink" style={style} onClick={handleClick}></div>
            </div>
        </div>
    );
}
export default Hex;
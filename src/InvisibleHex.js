
function InvisibleHex ({border, color}) {

    const style = {
        backgroundColor: color
    }

    return (
        <div className={"invisibleHex" + border}>
            <div className="hexIn">
            <div className="hexLink" style={style}></div>
            </div>
        </div>
    );
}
export default InvisibleHex;
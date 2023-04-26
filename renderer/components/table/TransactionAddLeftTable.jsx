import {memo, useContext} from "react";
import {fixNumber} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export const TransactionAddLeftTable = memo(({onClickHandler, isReturn}) => {
    const {addCart, returnEditCart} = useContext(GlobalContext);

    return (
        <>
            {
                addCart.map((product) => {
                    const isProductInReturnCart = isReturn && returnEditCart.find((item) => item.id === product.id);
                    const clickable = !isProductInReturnCart;
                    const onClick = clickable ? () => onClickHandler(product.id, product.quantity, true) : undefined;
                    return (
                        <tr key={product.id} id={product.id} onClick={onClick}>
                            <td className={clickable ? "" : "mute"}>{product.id}</td>
                            <td>{parseInt(product.quantity).toLocaleString()}</td>
                            <td>&#8369; {fixNumber(product.total)}</td>
                        </tr>
                    );
                })
            }
        </>
    );
});
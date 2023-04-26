import {forwardRef, useContext, useRef} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {fixNumber} from "../../helper/GlobalHelper";

export const ProductHistoryModal = forwardRef(({id,description},ref)=> {
    const infoTable = useRef()
    const discountTable = useRef()
    const productHistory = useContext(GlobalContext).productHistoryInfo
    const discountHistory = useContext(GlobalContext).discountHistoryInfo

    const handleSwapTable = (e)=> {
        if(infoTable.current.classList.contains('hidden')) {
            infoTable.current.classList.remove('hidden')
            discountTable.current.classList.add('hidden')
            e.currentTarget.value = 'Product'
        }else {
            infoTable.current.classList.add('hidden')
            discountTable.current.classList.remove('hidden')
            e.currentTarget.value = 'Discount'
        }
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                }
            }}
        >
            <div className="modal-container modal-xl product-history-modal">
                <div className="modal-header">
                    <div>
                        <h1>{id}</h1>
                        <h3>{description}</h3>
                    </div>
                    <input type="button" className={'btn'} defaultValue={'Product'}
                           onClick={(e)=> handleSwapTable(e)}
                    />
                </div>
                <div className="modal-body">
                    <div ref={infoTable}>
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                 productHistory.map(item => (
                                     <tr key={item.num}>
                                         <td>{item.id}</td>
                                         <td>{item.name}</td>
                                         <td>&#8369; {fixNumber(item.price)}</td>
                                         <td>{item.createdAt}</td>
                                     </tr>
                                 ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div ref={discountTable} className={'hidden'}>
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Id</th>
                                    <th>Qty</th>
                                    <th>Disc %</th>
                                    <th>Removed At</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                discountHistory.map(item => (
                                    <tr key={item.num}>
                                        <td>{item.id}</td>
                                        <td>{item.quantity.toLocaleString()}</td>
                                        <td>{item.discount} %</td>
                                        <td>{item.timestamp}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
})
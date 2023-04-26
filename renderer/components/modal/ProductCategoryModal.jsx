import {forwardRef, useContext, useRef} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {toggleDropdownList} from "../../helper/GlobalHelper";

export const ProductCategoryModal = forwardRef(({id,description},ref)=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const categories = Object.values(useContext(GlobalContext).categories)
    const privateList = useContext(GlobalContext).privateCategoryList
    const setPrivateList = useContext(GlobalContext).setPrivateCategoryList
    const modal = useContext(GlobalContext).modalRef.current.productCategory
    const categoryList = useRef()
    const categoryBtn = useRef()

    const handleAddCategory = ()=> {
        const name = categoryBtn.current.value.toUpperCase()
            .replaceAll(' ','_')
            .replaceAll('/','_')
        if(!privateList.includes(name)) {
            setPrivateList(prevList => [...prevList, name])
        }
    }

    const handleRemoveCategory = ()=> {
        const name = categoryBtn.current.value.toUpperCase()
            .replaceAll(' ','_')
            .replaceAll('/','_')
        const filterList = privateList.filter(category => category !== name)
        setPrivateList(filterList)
    }

    const handleSave = ()=> {
        fetch(`${ip}/merchandise/save-all-category`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setPrivateListProperty())
        }).then(()=> {
            ipcRenderer.send('showMessage','Product Category', 'Categories is successfully updated...')
            modal.classList.add('hidden')
        })
    }

    const setPrivateListProperty = ()=> {
        if(privateList.length === 0) {
            return [{
                id: id,
                category: 'NONE'
            }]
        }
        return privateList.map(category => ({
            id: id,
            category: category.toString().toUpperCase().replaceAll(' ','_')
        }))
    }

    return (
        <div className="modal-bg hidden" ref={ref}
            onClick={(e)=> {
                if(e.target === e.currentTarget) {
                    e.currentTarget.classList.add('hidden')
                }
            }}
        >
            <div className="modal-container modal-h-md product-category-modal">
                <div className="modal-header">
                    <h1>{id}</h1>
                    <h3>{description}</h3>
                </div>
                <div className="modal-body">
                    <div>
                        <div className="dropdown">
                            <input ref={categoryBtn} type="button" className="dropdown-btn btn" defaultValue={'Baking'}
                                onClick={()=> toggleDropdownList(categoryList.current)}
                            />
                            <ul ref={categoryList} className={'dropdown-list'}>
                                {
                                    categories.map(category => {
                                        if(category !== 'All')
                                            return <li key={category.toString()} onClick={()=> categoryBtn.current.value = category}>
                                                {category}
                                        </li>
                                    })
                                }
                            </ul>
                        </div>
                        <div>
                            <input type="button" className={'btn'} onClick={handleAddCategory}/>
                            <input type="button" className={'btn'} onClick={handleRemoveCategory}/>
                        </div>
                    </div>
                    <div>
                        <table className={'product-table'}>
                            <tbody>
                            {
                                privateList.map((category) => (
                                    <tr key={category.toString()}>
                                        <td>{category.toUpperCase().replaceAll('_',' ')}</td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-footer">
                    <input type="button" className={'btn'} defaultValue={'Save'} onClick={handleSave}/>
                </div>
            </div>
        </div>
    )
})
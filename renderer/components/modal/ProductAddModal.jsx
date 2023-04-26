import {forwardRef, useContext, useEffect, useRef, useState} from "react";
import {capitalizeWords, toggleDropdownList} from "../../helper/GlobalHelper";
import {GlobalContext} from "../../context/GlobalContext";

export const ProductAddModal = forwardRef(({start}, ref)=> {
    const ip = useContext(GlobalContext).ip
    const ipcRenderer = useContext(GlobalContext).ipcRenderer
    const modal = useContext(GlobalContext).modalRef.current.productAdd
    const categories = Object.values(useContext(GlobalContext).categories)
    const categoryBtn = useRef()
    const categoryList = useRef()
    const footerBtn = useRef()
    const addBtn = useRef()
    const firstPhase = useRef()
    const secondPhase = useRef()
    const idInput = useRef()
    const descriptionInput = useRef()
    const priceInput = useRef()
    const boxInput = useRef()
    const [addCategory, setAddCategory] = useState([])
    const [interval, setIntervalId] = useState(0)

    useEffect(()=> {
        footerBtn.current.value = 'Next'
    },[])

    useEffect(()=> {
        if(addCategory.length === 0) {
            footerBtn.current.classList.add('disabled')
            clearInterval(interval)
        } else {
            footerBtn.current.classList.remove('disabled')
            startFindId()
        }
    },[addCategory])

    const handleAddProduct = ()=> {
        const data = {
            merchandise: {
                id: idInput.current.value.toUpperCase(),
                description: capitalizeWords(descriptionInput.current.value),
                price: priceInput.current.value,
                piecesPerBox: boxInput.current.value,
                quantity: 0
            },
            categoryList: setAddCategoryProperty()
        }
        fetch(`${ip}/merchandise/add-product`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(()=> {
            ipcRenderer.send('showMessage','Product Add','Product successfully added to the list.')
            reset()
            modal.classList.add('hidden')
        })
    }

    const setAddCategoryProperty = ()=> {
        return addCategory.map(category => {
            return category.toUpperCase()
                .replaceAll(' ','_')
                .replaceAll('/','_')
        })
    }

    const handleAdd = ()=> {
        const name = categoryBtn.current.value.toUpperCase()
            .replaceAll(' ','_')
            .replaceAll('/','_')
        if(!addCategory.includes(name)) {
            setAddCategory(prevList => [...prevList, name])
        }
    }

    const handleRemove = ()=> {
        const name = categoryBtn.current.value.toUpperCase()
            .replaceAll(' ','_')
            .replaceAll('/','_')
        const filterList = addCategory.filter(category => category !== name)
        setAddCategory(filterList)
    }

    const handleAddBtnClass = ()=> {
        const id = idInput.current.classList
        const price = priceInput.current.classList
        const box = boxInput.current.classList
        const description = descriptionInput.current.classList
        if(id.contains('error') ||
            price.contains('error') ||
            box.contains('error') ||
            description.contains('error')) {
            addBtn.current.classList.add('disabled')
        }else addBtn.current.classList.remove('disabled')
    }

    const startFindId = ()=> {
        setIntervalId(setInterval(()=> {
            fetch(`${ip}/merchandise/generate?id=${idInput.current.value}`)
                .then(res => {return res.text()})
                .then(id => {
                    idInput.current.value = id
                })
        }, 1000))
    }

    const handleDescription = (e)=> {
        if(e.currentTarget.value.length === 0) {
            descriptionInput.current.classList.add('error')
            descriptionInput.current.classList.remove('valid')
        }else {
            descriptionInput.current.classList.remove('error')
            descriptionInput.current.classList.add('valid')
        }
        handleAddBtnClass()
    }

    const handlePrice = ()=> {
        let price = priceInput.current.value
        price = price === '' ? 0 : price
        if(price <= 0) {
            priceInput.current.classList.add('error')
            priceInput.current.classList.remove('valid')
        }else {
            priceInput.current.classList.remove('error')
            priceInput.current.classList.add('valid')
        }
        handleAddBtnClass()
    }

    const handleBox = ()=> {
        const box = boxInput.current.value
        const isDecimal = box % 1 !== 0
        if(box <= 0 || isDecimal) {
            boxInput.current.classList.add('error')
            boxInput.current.classList.remove('valid')
        }else {
            boxInput.current.classList.remove('error')
            boxInput.current.classList.add('valid')
        }
        handleAddBtnClass()
    }

    const reset = ()=> {
        addBtn.current.classList.add('disabled')
        addBtn.current.classList.remove('visible')
        descriptionInput.current.value = ''
        descriptionInput.current.classList.add('error')
        descriptionInput.current.classList.remove('valid')
        priceInput.current.value = ''
        priceInput.current.classList.add('error')
        priceInput.current.classList.remove('valid')
        boxInput.current.value = ''
        boxInput.current.classList.add('error')
        boxInput.current.classList.remove('valid')
        setAddCategory([])
        firstPhase.current.style.display = 'block'
        secondPhase.current.style.display = 'none'
    }

    const handleAddBtn = (e)=> {
        const flag = e.currentTarget.value === 'Next'
        if(flag) {
            e.currentTarget.value = 'Prev'
            firstPhase.current.style.display = 'none'
            secondPhase.current.style.display = 'block'
            addBtn.current.classList.add('visible')
        }else {
            e.currentTarget.value = 'Next'
            firstPhase.current.style.display = 'block'
            secondPhase.current.style.display = 'none'
            addBtn.current.classList.remove('visible')
        }
    }

    const handleId = ()=> {
        const id = idInput.current.value
        if (!/^[a-zA-Z0-9]/.test(id)) {
            idInput.current.classList.add('error')
            idInput.current.classList.remove('valid')
            handleAddBtnClass()
        } else {
            addBtn.current.classList.remove('disabled')
            fetch(`${ip}/merchandise/product-exist?id=${id}`)
                .then(res => {return res.json()})
                .then(isExist => {
                    if(isExist) {
                        idInput.current.classList.add('error')
                        idInput.current.classList.remove('valid')
                    }else {
                        idInput.current.classList.remove('error')
                        idInput.current.classList.add('valid')
                    }
                    handleAddBtnClass()
                })
        }
    }

    return (
        <div className="modal-bg hidden" ref={ref}
             onClick={(e)=> {
                 if(e.target === e.currentTarget) {
                     e.currentTarget.classList.add('hidden')
                     clearInterval(interval)
                     reset()
                 }
             }}
        >
            <div className="modal-container product-add-modal">
                <div className="modal-header">
                    <h1>Product Add</h1>
                </div>
                <div className="modal-body">
                    <div ref={firstPhase}>
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
                                <input type="button" className={'btn'} onClick={handleAdd}/>
                                <input type="button" className={'btn'} onClick={handleRemove}/>
                            </div>
                        </div>
                        <div>
                            <table className={'product-table'}>
                                <tbody>
                                    {
                                        addCategory.map(category => (
                                            <tr key={category}>
                                                <td>{category.toUpperCase().replaceAll('_',' ')}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div ref={secondPhase}>
                        <div>
                            <input ref={idInput} className={'valid'} type="text" placeholder={'Id'} readOnly={true}/>
                            <input ref={descriptionInput} className={'error'} type="text" placeholder={'Description'}
                                onChange={(e)=> handleDescription(e)}
                            />
                            <input ref={priceInput} className={'error'} type="number" placeholder={'Price'} onChange={handlePrice}/>
                            <input ref={boxInput} className={'error'} type="number" placeholder={'Pieces Per Box'} onChange={handleBox}/>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <input ref={footerBtn} type="button" className={'btn disabled'}
                        onClick={(e)=> handleAddBtn(e)}
                    />
                    <input ref={addBtn} type={'button'} className={'btn disabled'} defaultValue={'Add'} onClick={handleAddProduct}/>
                </div>
            </div>
        </div>
    )
})
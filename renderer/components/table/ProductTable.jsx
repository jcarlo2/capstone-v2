import {ProductTableRow} from "./ProductTableRow";
import {useCallback, useContext, useEffect, useLayoutEffect, useRef, useState} from "react";
import {GlobalContext} from "../../context/GlobalContext";
import {
    capitalizeWords,
    replaceSpaceAndSlash,
    toggleDropdownList,
    dropdownClickHandler,
    handleScroll
} from "../../helper/GlobalHelper";

export const ProductTable = ({rowHandler})=> {
    const ip = useContext(GlobalContext).ip
    const categories = useContext(GlobalContext).categories
    const {isShow, color} = useContext(GlobalContext).notificationInfo
    const notificationModal = useContext(GlobalContext).modalRef.current.notification
    const filter = useRef()
    const sort = useRef()
    const ascending = useRef()
    const notificationIcon = useRef()
    const [filterValue, setFilterValue] = useState('All')
    const [sortValue, setSortValue] = useState('Sort By: Id')
    const [productList, setProductList] = useState([])
    const [option, setOption] = useState({
        size: 50,
        sort: 'id',
        filter: 'all',
        search: '',
        order: true,
    })

    useEffect(()=> {
        setFilterValue(capitalizeWords(replaceSpaceAndSlash(option.filter,'_')))
        setSortValue(`Sort By: ${capitalizeWords(replaceSpaceAndSlash(option.sort,'_'))}`)
        document.addEventListener('click',dropdownClickHandler)
        return ()=> document.removeEventListener('click',dropdownClickHandler)
    },[])

    const populateProductList = useCallback(() => {
        fetch(`${ip}/merchandise/find-all?` +
                                       `size=${option.size}&` +
                                       `sortBy=${option.sort}&` +
                                       `filterBy=${option.filter}&` +
                                       `search=${option.search}&` +
                                       `isAscending=${option.order}`)
            .then((res) => {return res.json()})
            .then((data) => setProductList(data))
    }, [ip, option.filter, option.search, option.size, option.sort, option.order])

    useEffect(() => {
        const interval = setInterval(() => {
            populateProductList()
        }, 1000)
        return () => clearInterval(interval)
    }, [populateProductList])

    useLayoutEffect(()=> {
        document.addEventListener('click',dropdownClickHandler)
        return ()=> document.removeEventListener('click',dropdownClickHandler)
    },[])

    const dropdownOnClickHandler = (e,isFilter)=> {
        const text = e.currentTarget.textContent
        const updatedOption = isFilter
            ? { ...option, filter: replaceSpaceAndSlash(text, '_') }
            : { ...option, sort: replaceSpaceAndSlash(text, '_') }
        setOption(updatedOption);

        if (isFilter) setFilterValue(text)
        else setSortValue(`Sort By: ${text}`)
    }

    return (
        <div>
            <div>
            <div>
                <input defaultValue={option.search} onKeyUp={(e)=> setOption({...option,search: e.currentTarget.value})} type="text" placeholder={'Search by id, desc, or price'}/>
                <div className="dropdown">
                    <input onClick={()=> toggleDropdownList(filter.current)} type="button" className={'btn dropdown-btn'} defaultValue={filterValue}/>
                    <ul ref={filter} className={'dropdown-list'}>
                        {Object.values(categories).map((category) => (
                            <li key={category.toString()} onClick={(e) => dropdownOnClickHandler(e, true)}>
                                {category}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className={'legend'}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div>
                <div  className="dropdown">
                    <input onClick={()=> toggleDropdownList(sort.current)} type="button" className={'btn dropdown-btn'} defaultValue={sortValue}/>
                    <ul ref={sort} className={'dropdown-list'}>
                        <li onClick={(e)=> dropdownOnClickHandler(e, false)}>Id</li>
                        <li onClick={(e)=> dropdownOnClickHandler(e, false)}>Description</li>
                        <li onClick={(e)=> dropdownOnClickHandler(e, false)}>Price</li>
                        <li onClick={(e)=> dropdownOnClickHandler(e, false)}>Stock</li>
                    </ul>
                </div>
                <input ref={ascending} type="button" className={'btn'} defaultValue={option.order ? 'ASC' : 'DESC'}
                    onClick={()=> setOption(prevState => ({...prevState, order: !prevState.order}))}
                />
                <svg ref={notificationIcon} width="800px" height="800px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"
                     className={`pulse ${isShow ? '' : '' } ${color}`}
                     onClick={()=> {
                         notificationModal.classList.remove('hidden')
                     }}
                >
                    <path d="M10.656 8.864q0-2.208 1.568-3.776t3.776-1.568 3.776 1.568 1.6 3.776q0 0.256-0.064 0.448l-1.76 6.944q-0.096 1.408-1.12 2.368t-2.432 0.96q-1.376 0-2.4-0.928t-1.152-2.304q-0.32-0.96-0.672-2.112t-0.736-2.784-0.384-2.592zM12.416 24.928q0-1.472 1.056-2.496t2.528-1.056 2.528 1.056 1.056 2.496q0 1.504-1.056 2.528t-2.528 1.056-2.528-1.056-1.056-2.528z"></path>
                </svg>
            </div>
            </div>
            <div>
            <table className={'product-table'}>
               <thead>
               <tr>
                   <th>Id</th>
                   <th>Description</th>
                   <th>Price</th>
                   <th>Stock</th>
               </tr>
               </thead>
               <tbody onScroll={(e)=> handleScroll(e,setOption)}>
               {<ProductTableRow data={productList} onClickHandler={rowHandler}/>}
               </tbody>
            </table>
            </div>
        </div>
    )
}
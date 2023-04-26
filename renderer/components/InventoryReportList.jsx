import {useContext, useEffect, useRef, useState} from "react";
import {GlobalContext} from "../context/GlobalContext";
import {dropdownClickHandler, handleScroll, toggleDropdownList} from "../helper/GlobalHelper";

export const InventoryReportList = ({lossTable, goodsTable, invalidate})=> {
    const ip = useContext(GlobalContext).ip
    const setId = useContext(GlobalContext).setInventoryHistoryReportId
    const [categoryBtnName, setCategoryBtnName] = useState('Inventory Loss')
    const categoryBtn = useRef()
    const [subCategoryBtnName, setSubCategoryBtnName] = useState('Default: Active')
    const subCategory = useRef()
    const [dateToday, setDateToday] = useState('2100-01-01')
    const [reportList, setReportList] = useState([])
    const [option, setOption] = useState({
        type: 'loss',
        category: 'default',
        isValid: true,
        isArchived: false,
        search: '',
        start: '2000-01-01',
        end: '3023-12-31',
        size: 50
    })

    useEffect(()=> {
        getDateToday()
        document.addEventListener('click',dropdownClickHandler)
        return ()=> document.removeEventListener('click',dropdownClickHandler)
    },[])

    useEffect(()=> {
       const interval = setInterval(()=> {
           fetch(`${ip}/loss-goods/find-report`, {
               method: "POST",
               headers: {
                   "Content-Type": "application/json"
               },
               body: JSON.stringify(option)
           }).then(res=> {return res.json()})
               .then(setReportList)
       },1000)
        return ()=> clearInterval(interval)
    },[option])

    const getDateToday = ()=> {
        fetch(`${ip}/date/get-date`)
            .then(res => {return res.text()})
            .then(date => setDateToday(date.split(' ')[0]))
    }

    const handleOption = (e)=> {
        let text = e.currentTarget.textContent
        setSubCategoryBtnName(text)
        const arr = text.split(' ')
        const category = arr[0].charAt(0) === 'D' ? 'default' : 'returned'
        let valid = true
        let archived = false
        if(text === 'Default: Active') invalidate.current.style.visibility = 'visible'
        else invalidate.current.style.visibility = 'hidden'
        if(arr[1] === 'Archived') archived = true
        else if(arr[1] === 'Inactive') {
            valid = false
            archived = true
        }
        setOption(prevState => ({
            ...prevState,
            isValid: valid,
            isArchived: archived,
            category: category
        }))
        setId('')
    }

    const handleSearchAndDate = (val,property)=> {
        if(property === 'start' && val === '') val = '2000-01-01'
        else if(property === 'end' && val === '') val = '3023-12-31'
        setOption(prevState => ({
            ...prevState,
            [property]: val
        }))
    }

    return (
        <>
            <table className={'report-list-table'}>
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody onScroll={(e)=> handleScroll(e,setOption)}>
                {
                    reportList.map(item => (
                        <tr key={item.id} onClick={()=> setId(item.id)}>
                            <td>{item.id}</td>
                            <td>{item.timestamp}</td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
            <div className={'report-list-option'}>
                <div>
                    <input ref={categoryBtn} type="button" className={'btn dropdown-btn loss'} defaultValue={categoryBtnName}
                           onClick={(e) => {
                               const el = e.currentTarget
                               el.classList.toggle('loss')
                               el.classList.toggle('goods')
                               if(el.classList.contains('loss')) {
                                   setCategoryBtnName('Inventory Loss')
                                   goodsTable.current.style.display = 'none'
                                   lossTable.current.style.display = 'table'
                               }else {
                                   setCategoryBtnName('Goods Receipt')
                                   goodsTable.current.style.display = 'table'
                                   lossTable.current.style.display = 'none'
                               }
                               setId('')
                               setOption(prevState => ({
                                   ...prevState,
                                   type: el.classList.contains('loss') ? 'loss' : 'goods'
                               }))
                           }}
                    />
                    <div className={'dropdown'}>
                        <input type="button" className={'btn dropdown-btn'} defaultValue={subCategoryBtnName}
                               onClick={()=> {
                                   toggleDropdownList(subCategory.current)
                               }}
                        />
                        <ul ref={subCategory} className={'dropdown-list up'}>
                            <li onClick={(e)=> handleOption(e)}>Default: Active</li>
                            <li onClick={(e)=> handleOption(e)}>Default: Archived</li>
                            <li onClick={(e)=> handleOption(e)}>Default: Inactive</li>
                            <li onClick={(e)=> handleOption(e)}>Returned: Active</li>
                            <li onClick={(e)=> handleOption(e)}>Returned: Archived</li>
                            <li onClick={(e)=> handleOption(e)}>Returned: Inactive</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <input type="text" placeholder={'Search by id ...'}
                       onChange={(e)=> handleSearchAndDate(e.currentTarget.value,'search')}
                    />
                </div>
                <div>
                    <div>
                        <span>Start</span>
                        <input type="date" max={dateToday}
                           onChange={(e)=> handleSearchAndDate(e.currentTarget.value,'start')}
                        />
                    </div>
                    <div>
                        <span>End</span>
                        <input type="date" max={dateToday}
                           onChange={(e)=> handleSearchAndDate(e.currentTarget.value,'end')}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
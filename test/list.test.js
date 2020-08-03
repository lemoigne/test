import List from '../src/scripts/list.js';

let list

beforeAll(() => {
  document.body.innerHTML = '<section id="list"></section>'
  list = new List('#list')
  list.computedList = [
    {
      lastname: 'dummy name a',
      firstname: 'dummy firstname',
      age: 31,
      eyeColor: 'dummy brown',
      company: 'dummy company',
      email: 'dummy.dummy@dummy.dummy',
      isActive: true
    },
    {
      lastname: 'dummy name b',
      firstname: 'dummy firstname',
      age: 22,
      eyeColor: 'dummy blue',
      company: 'dummy company',
      email: 'dummy.dummy@dummy.dummy',
      isActive: true
    }
  ]
})

beforeEach(() => {
  jsdom.reconfigure({
    url: "http://www.example.com/"
  })
})

describe('init', () => {
  it('should call getQuery', () => {
    const query = { eye: "Brown" }
    const spyGetParams = jest.spyOn(list, 'getQuery') 
    list.init()
    expect(list.getQuery).toHaveBeenCalled()
    spyGetParams.mockRestore()
  })

  it('should call generateFilter with the right params', () => {
    const query = { eye: "Brown" }
    const spyGenerateFilter = jest.spyOn(list, 'generateFilter')
    const spyGetParams = jest.spyOn(list, 'getQuery').mockImplementation(() => query) 
    list.init()
    expect(list.generateFilter).toHaveBeenCalledTimes(1)
    expect(list.generateFilter).toHaveBeenLastCalledWith(query)
    spyGenerateFilter.mockRestore()
    spyGetParams.mockRestore()
  })
  it('should call generateTable', () => {
    const spyGenerateTable = jest.spyOn(list, 'generateTable')
    list.init()
    expect(list.generateTable).toHaveBeenCalledTimes(1)
    spyGenerateTable.mockRestore()
  })
  it('should set list data', () => {
    list.init()
    expect(list.list).toEqual(list.computedList)
  })
})

describe('filterList', () => {
  it('should return the right object', () => {
    list.init()
    
    list.filterList({ eye: "dummy brown" })
    expect(list.list).toEqual([list.computedList[0]])

    list.filterList({ age: 1 })

    expect(list.list).toEqual([list.computedList[1]])
  })

  it('should call generateList', () => {
    list.init()
    const spyGenerateList = jest.spyOn(list, 'generateList')
    list.filterList({ eye: "dummy brown" })

    expect(list.generateList).toHaveBeenCalledTimes(1)
    spyGenerateList.mockRestore()
  })
})

describe('updateQueryStringParameter', () => {

  it('should return the right query', () => {
    jsdom.reconfigure({
      url: "http://www.example.com/?eye=brown&age=2"
    })

    expect(list.updateQueryStringParameter('eye', 'brown')).toEqual('?eye=brown&age=2')
    expect(list.updateQueryStringParameter('eye', '')).toEqual('?age=2')
    expect(list.updateQueryStringParameter('age', '3')).toEqual('?eye=brown&age=3')
  })

  it('should return the url without query', () => {
    jsdom.reconfigure({
      url: "http://www.example.com/?eye=brown"
    })
    list.init()

    expect(list.updateQueryStringParameter('eye', '')).toEqual('http://www.example.com/')
  })
})

describe('sort', () => {
  it('should sort list', () => {
    list.init()
    list.sort('lastname', 'asc')
    expect(list.list[0].lastname).toEqual('dummy name b')
    list.sort('lastname', 'desc')
    expect(list.list[0].lastname).toEqual('dummy name a')
  })
})
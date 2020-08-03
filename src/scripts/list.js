import data from '../data/data.json';
import url from 'url';


export default class List {
  constructor(element) {
    this.element = document.querySelector(element)
    this.body = null
    this.head = null
    this.list = null
    this.data = data
    this.lines = null
    this.fragment = null
    this.columns = [{
      label: 'lastname',
      sort: 'desc'
    },
    {
      label: 'firstname',
      sort: 'desc'
    },
    {
      label: 'age',
      sort: 'desc'
    },
    {
      label: 'eyeColor',
      sort: 'desc'
    },
    {
      label: 'company',
      sort: 'desc'
    },
    {
      label: 'email',
      sort: 'desc'
    },
    {
      label: 'isActive',
      sort: 'desc'
    }]
    this.computedList = this.data.map(item => {
      return {
        lastname: item.name.last,
        firstname: item.name.first,
        age: item.age,
        eyeColor: item.eyeColor,
        company: item.company,
        email: item.email,
        isActive: item.isActive
      }
    })
    this.eyeFilterData = ['Blue', 'Brown', 'Green']
    this.ageFilterData = [
      {
        label: 'de 20 à 25 ans',
        value: 1,
        min: 20,
        max: 25
      },
      {
        label: 'de 26 à 30 ans',
        value: 2,
        min: 26,
        max: 30
      },
      {
        label: 'de 31 à 35 ans',
        value: 3,
        min: 31,
        max: 35
      },
      {
        label: 'de 36 à 41 ans',
        value: 4,
        min: 36,
        max: 41
      }
    ]
  }

  init() {
    this.list = [...this.computedList]
    const query = this.getQuery()
    this.generateFilter(query)
    this.generateTable()
    this.filterList(query)
  }

  getQuery() {
    return url.parse(window.location.href, true)['query']
  }

  filterList(query) {
    this.list = [...this.computedList]
    Object.entries(query).forEach(item => {
      if (item[0] === 'age') {
        const selectedAge = this.ageFilterData.find(age => age.value === parseInt(item[1]))
        this.list = this.list.filter(i => i.age >= selectedAge.min && i.age <= selectedAge.max)
      } else if (item[0] === 'eye') {
        this.list = this.list.filter(i => i.eyeColor.toLowerCase() === item[1].toLowerCase())
      }
    })
    this.generateList()
  }

  updateQueryStringParameter(key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = window.location.href.indexOf('?') !== -1 ? "&" : "?";
    const uri = window.location.href
    if (uri.match(re)) {
      if (!value) {
        if (uri.indexOf('&') === -1) {
          return uri.split("?")[0]
        }
        const queries = Object.keys(this.getQuery())
        const queryIsLast = queries.findIndex(item => item === key) === queries.length -1
        return location.search.replace(re, queryIsLast ? '' : '$1')
      } else {
        return location.search.replace(re, '$1' + key + "=" + value + '$2')
      }
    }
    else {
      return location.search + separator + key + "=" + value;
    }
  }

  selectFilter(select) {
    window.history.pushState(null, null, this.updateQueryStringParameter(select, event.target.value))
    this.filterList(this.getQuery())
  }

  sort(id, value) {
    this.list = this.list.sort((a, b) => {
      return value === 'asc' ? String(b[id]).localeCompare(String(a[id])) : String(a[id]).localeCompare(String(b[id]))
    })
    this.columns = this.columns.map(column => {
      if (column.label === id) {
        column.sort = column.sort === 'asc' ? 'desc' : 'asc'
      }
      return column
    })
  }

  sortTable(event) {
    const selected = event.currentTarget.getAttribute('id')
    const sort = this.columns.find(column => column.label === selected).sort
    this.sort(selected, sort)
    this.generateList()
  }

  generateList() {
    const fragment = document.createDocumentFragment()
    this.list.forEach(line => {
      const tr = document.createElement('tr')
      this.columns.forEach(column => {
        tr.appendChild(this.htmlToElement(`<td>${line[column.label]}</td>`))
      })
      fragment.appendChild(tr)
    })
    this.body.innerHTML = ''
    this.body.appendChild(fragment)
  }
  
  generateFilter(query) {
    const eyeFragment = document.createDocumentFragment()
    const ageFragment = document.createDocumentFragment()
    const section = document.createElement('section')
    const eyeSelect = document.createElement('select')
    eyeSelect.setAttribute('id', 'eyeFilter')
    const ageSelect = document.createElement('select')
    ageSelect.setAttribute('id', 'ageFilter')
    this.eyeFilterData.forEach(filter => {
      eyeSelect.appendChild(this.htmlToElement(`<option value="${filter}" ${query.eye && query.eye !== filter ? null : 'selected'}>${filter}</option>`))
    })
    this.ageFilterData.forEach(filter => {
      const selectedAge = query.age ? this.ageFilterData.find(age => age.value === parseInt(query.age)) : null
      ageSelect.appendChild(this.htmlToElement(`<option value="${filter.value}" ${!selectedAge || selectedAge.value !== parseInt(filter.value) ? null : 'selected'}>${filter.label}</option>`))
    })
    eyeSelect.appendChild(this.htmlToElement(`<option value="" ${query.eye ? null : 'selected'}>Sélectionnez la couleur des yeux</option>`))
    ageSelect.appendChild(this.htmlToElement(`<option value="" ${query.age ? null : 'selected'}>Sélectionnez une tranche d'age</option>`))
    ageFragment.appendChild(ageSelect)
    eyeFragment.appendChild(eyeSelect)
    section.appendChild(eyeFragment)
    section.appendChild(ageFragment)
    this.element.prepend(section)
    this.element.querySelector('#ageFilter').addEventListener('change', this.selectFilter.bind(this, 'age'))
    this.element.querySelector('#eyeFilter').addEventListener('change', this.selectFilter.bind(this, 'eye'))
  }

  generateTable() {
    const fragment = document.createDocumentFragment()
    const table = document.createElement('table')
    table.setAttribute('class', 'list__table')
    table.appendChild(this.htmlToElement(`
      <thead class="list__head">
      </thead>
      <tbody class="list__body">
      </tbody>
    `))
    this.element.appendChild(table)
    this.body = this.element.querySelector('.list__body')
    this.head = this.element.querySelector('.list__head')
    const tr = document.createElement('tr')
    this.columns.forEach(column => {
      tr.appendChild(this.htmlToElement(`<td><button class="list__sort" id="${column.label}">${column.label}</button></td>`))
      fragment.appendChild(tr)
    })
    this.head.appendChild(fragment)

    this.head.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', this.sortTable.bind(this))
    })
  }

  htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content
}
}
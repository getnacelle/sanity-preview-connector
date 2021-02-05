import { $nacelle } from './nacelle-client-sanity-preview'
import './style.css'

async function fetchNacelleData() {
  const allContent = await $nacelle.data.allContent()
  const allContentByType = allContent.reduce((acc, el) => {
    acc[el.type] = acc[el.type] ? { ...acc[el.type], el } : el

    return acc
  }, {})
  const allContentTypes = Object.keys(allContentByType)
  const select = document.querySelector('select')
  Object.keys(allContentByType).forEach(type => {
    const existingOption = document.querySelector('option[value="page"]')
    if (!existingOption) {
      const option = document.createElement('option')
      option.value = type
      option.innerText = type
      select.appendChild(option)
    }
  })
  const idx = select.selectedIndex !== -1 ? select.selectedIndex : 0
  let activeType = allContentTypes[idx]

  function handleContentTypeChange(e) {
    activeType = e.target.value
    const data = JSON.stringify(allContentByType[activeType], null, 2)
    document.getElementById('results').innerText = data
  }

  select.oninput = handleContentTypeChange
  document.getElementById('results').innerText = JSON.stringify(
    allContentByType[activeType],
    null,
    2
  )
}

fetchNacelleData()

document.getElementById('refresh').onclick = () => {
  console.info(`[${new Date().toLocaleTimeString()}] Fetching fresh data...`)
  document.getElementById('refresh').disabled = true
  fetchNacelleData().then(
    () => (document.getElementById('refresh').disabled = false)
  )
}

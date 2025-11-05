import './index.css'

function initSubscriptionForm() {
  const form = document.querySelector('form')
  const input = document.querySelector('input[type=email]')
  const submit = document.querySelector('input[type=submit]')
  const url = form.action

  submit.addEventListener('click', (e) => {
    e.preventDefault()

    const params = {
      subscription: {
        email: input.value
      }
    }

    // console.log(form, params)

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)

        const container = document.createElement('div')

        const message = document.createElement('p')
        message.innerText = data.success_text

        const link = document.createElement('a')
        link.innerText = 'Посмотрите популярные палитры'
        link.href = '/preview.html'

        container.appendChild(message)
        container.appendChild(link)
        form.replaceWith(container)
      })
  })
}

function initPreviewPage() {
  const container = document.querySelector('.swatches')
  const url = container.dataset.url

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)

      data.forEach((swatch) => {
        createSwatchPreview(swatch, container)
      })
    })
}

function createSwatchPreview(swatchData, container) {
  const swatch = document.createElement('div')
  const h2 = document.createElement('h2')
  const fills = document.createElement('div')

  swatchData.fills.forEach((fillData) => {
    const fill = document.createElement('div')
    const color = document.createElement('div')
    const info = document.createElement('div')
    const hex = document.createElement('div')
    const name = document.createElement('div')

    color.innerText = 'здесь будет цвет'
    hex.innerText = `Colors: ${fillData.colors.length}`
    name.innerText = `Variable: ${fillData.name}`

    fill.appendChild(color)
    fill.appendChild(info)
    info.appendChild(hex)
    info.appendChild(name)
    fills.appendChild(fill)
  })

  h2.innerText = swatchData.name

  swatch.appendChild(h2)
  swatch.appendChild(fills)
  container.appendChild(swatch)
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('index')) {
    initSubscriptionForm()
  } else if (document.body.classList.contains('preview')) {
    initPreviewPage()
  }
})

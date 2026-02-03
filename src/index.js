import './index.css'
import Cookies from 'js-cookie'

// Cookies.remove('jwt')

function initSubscriptionForm() {
  const form = document.getElementById('subscriptionForm')
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

function authorizeUser() {
  const jwt = Cookies.get('jwt')

  if (jwt) {
    fetch('http://localhost:3000/api/v1/authorize_by_jwt.json', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)

        if (data.is_success) {
          const element = document.createElement('div')
          element.innerText = `Привет, ${data.email}!`

          const signOutButton = document.createElement('div')
          signOutButton.classList.add('textButton')
          signOutButton.innerText = 'Выйти'

          document.body.appendChild(element)
          document.body.appendChild(signOutButton)

          signOutButton.addEventListener('click', () => {
            fetch('http://localhost:3000/api/v1/sign_out.json', {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${jwt}`
              }
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data)

                element.remove()
                signOutButton.remove()
                Cookies.remove('jwt')
                initLoginForm()
                initSignupForm()
              })
          })
        }
      })
  } else {
    initLoginForm()
    initSignupForm()
  }
}

function initLoginForm() {
  const form = document.getElementById('loginForm')
  const url = form.action

  form.classList.remove('hidden')

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(form)

    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)

        if (data.jwt) {
          Cookies.set('jwt', data.jwt)
          window.location.reload()
        }
      })
  })
}

function initSignupForm() {
  const form = document.getElementById('signupForm')
  const url = form.action

  form.classList.remove('hidden')

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const formData = new FormData(form)

    fetch(url, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data)

        if (data.jwt) {
          Cookies.set('jwt', data.jwt)
          window.location.reload()
        }
      })
  })
}

function initPreviewPage() {
  const container = document.querySelector('.swatchesSection')
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
  const link = document.createElement('a')
  const fills = document.createElement('div')

  swatch.classList.add('swatch')
  fills.classList.add('fills')

  link.innerText = swatchData.name
  link.href = `${container.dataset.swatchUri}?swatch=${swatchData.id}`

  swatchData.fills.forEach((fillData) => {
    createFillCard(fillData, fills)
  })

  h2.appendChild(link)
  swatch.appendChild(h2)
  swatch.appendChild(fills)
  container.appendChild(swatch)
}

function createFillCard(data, container) {
  const fill = document.createElement('div')
  const color = document.createElement('div')
  const info = document.createElement('div')
  const hex = document.createElement('div')
  const name = document.createElement('div')

  fill.classList.add('fillCard')
  color.classList.add('fillColor')
  info.classList.add('fillCardInfo')
  name.classList.add('fillName')

  fill.dataset.id = data.id
  hex.innerText = `Colors: ${data.fill_colors.length}`
  name.innerText = `Variable: ${data.name}`

  setCssBackgroundValue(color, data)

  fill.appendChild(color)
  fill.appendChild(info)
  info.appendChild(hex)
  info.appendChild(name)
  container.appendChild(fill)
}

function setCssBackgroundValue(element, fill) {
  let cssColor

  if (fill.fill_colors.length > 1) {
    const colors = []

    fill.fill_colors.forEach((fill_color) => {
      colors.push(`#${fill_color.rgb_hash} ${fill_color.stop}%`)
    })

    const cssColors = colors.join(', ')
    cssColor = 'linear-gradient(90deg, ' + cssColors + ')'

    element.style.backgroundImage = cssColor
  } else if (fill.fill_colors.length == 1) {
    cssColor = '#' + fill.fill_colors[0].rgb_hash
    element.style.backgroundColor = cssColor
  }
}

function initSwatchPage() {
  const searchParams = new URLSearchParams(window.location.search)
  const id = searchParams.get('swatch')
  const url = document.body.dataset.url

  fetch(url + id)
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      createSwatchPreview(data, document.body)
    })
}

//
//
//
//
//
function initNewSwatchFrom() {
  const container = document.querySelector('.newSwatchForm')
  const getFillsUrl = container.dataset.getFillsUrl
  const createSwatchUrl = container.dataset.createSwatchUrl
  const jwt = Cookies.get('jwt')

  const addFillButton = document.createElement('div')
  addFillButton.innerText = 'Добавить заливку'
  addFillButton.classList.add('addFillButton')
  container.appendChild(addFillButton)

  let fillsContainerVisible = false

  addFillButton.addEventListener('click', () => {
    if (!fillsContainerVisible) {
      const headingInput = document.createElement('input')
      headingInput.placeholder = 'Придумайте название'
      headingInput.classList.add('headingInput')

      const swatchFillsContainer = document.createElement('div')
      swatchFillsContainer.classList.add('swatchFillsContainer')

      const fillsContainer = document.createElement('div')
      fillsContainer.classList.add('fillsContainer')

      const preloader = document.createElement('div')
      preloader.classList.add('preloader')
      preloader.innerText = 'Заливки загружаются...'

      const submitButton = document.createElement('div')
      submitButton.classList.add('submitButton')
      submitButton.classList.add('disabled')
      submitButton.innerText = 'Создать палитру'

      container.appendChild(headingInput)
      fillsContainer.appendChild(preloader)
      container.appendChild(swatchFillsContainer)
      container.appendChild(fillsContainer)
      container.appendChild(submitButton)

      fillsContainerVisible = true

      fetch(getFillsUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data)

          data.forEach((fillData) => {
            preloader.remove()
            createFillCard(fillData, fillsContainer)

            const fillCards = document.querySelectorAll('.fillCard')

            fillCards.forEach((fillCard) => {
              fillCard.addEventListener('click', () => {
                swatchFillsContainer.appendChild(fillCard)
              })
            })
          })

          submitButton.classList.remove('disabled')

          submitButton.addEventListener('click', () => {
            const fillCards = swatchFillsContainer.querySelectorAll('.fillCard')
            const fillIds = []

            fillCards.forEach((card) => {
              fillIds.push(card.dataset.id)
            })

            const params = {
              swatch: {
                name: headingInput.value,
                fill_ids: fillIds
              }
            }

            fetch(createSwatchUrl, {
              method: 'POST',
              headers: {
                'Content-type': 'application/json; charset=UTF-8',
                Authorization: `Bearer ${jwt}`
              },
              body: JSON.stringify(params)
            })
              .then((response) => response.json())
              .then((data) => {
                console.log(data)

                const redirectUrl = `http://localhost:8080/swatches/show.html?swatch=${data.swatch_id}`
                window.location.href = redirectUrl
              })
          })
        })
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  authorizeUser()

  if (
    document.body.classList.contains('home') &&
    document.body.classList.contains('index')
  ) {
    initSubscriptionForm()
  }

  if (
    document.body.classList.contains('swatches') &&
    document.body.classList.contains('index')
  ) {
    initPreviewPage()
  }

  if (
    document.body.classList.contains('swatches') &&
    document.body.classList.contains('show')
  ) {
    initSwatchPage()
  }

  if (
    document.body.classList.contains('swatches') &&
    document.body.classList.contains('new')
  ) {
    initNewSwatchFrom()
  }
})

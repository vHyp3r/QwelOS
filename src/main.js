import './style.css'

const browserPages = {
  home: {
    title: 'QwelOS Home',
    url: 'qwelos.local',
    description: 'A lightweight desktop OS demo built in the browser.',
    content: `
      <h1>Welcome to QwelOS</h1>
      <p>Your desktop environment is ready.</p>
      <div class="browser-card-grid">
        <div class="browser-card">
          <strong>Apps</strong>
          <span>Files, browser, terminal</span>
        </div>
        <div class="browser-card">
          <strong>Theme</strong>
          <span>Aurora-inspired desktop</span>
        </div>
        <div class="browser-card">
          <strong>Status</strong>
          <span>System online</span>
        </div>
      </div>
    `
  },
  docs: {
    title: 'Docs',
    url: 'qwelos.local/docs',
    description: 'Documentation and development notes for QwelOS.',
    content: `
      <h1>Project Docs</h1>
      <p>QwelOS is a web-based operating system shell with an app-like interface.</p>
      <ul>
        <li>Build the desktop shell</li>
        <li>Launch apps from the dock</li>
        <li>Open a browser and file manager</li>
      </ul>
    `
  },
  apps: {
    title: 'Apps',
    url: 'qwelos.local/apps',
    description: 'Installed apps and launchers.',
    content: `
      <h1>Installed Apps</h1>
      <div class="browser-list">
        <div>Terminal</div>
        <div>Browser</div>
        <div>Files</div>
        <div>Settings</div>
      </div>
    `
  }
}

const explorerTree = {
  Home: {
    name: 'Home',
    type: 'folder',
    items: {
      Documents: {
        name: 'Documents',
        type: 'folder',
        items: {
          'Project Notes': { name: 'Project Notes', type: 'file', extension: 'txt' },
          'Roadmap': { name: 'Roadmap', type: 'file', extension: 'md' }
        }
      },
      Downloads: {
        name: 'Downloads',
        type: 'folder',
        items: {
          'qwelos.iso': { name: 'qwelos.iso', type: 'file', extension: 'iso' },
          'wallpaper.jpg': { name: 'wallpaper.jpg', type: 'file', extension: 'jpg' }
        }
      },
      Projects: {
        name: 'Projects',
        type: 'folder',
        items: {
          'QwelOS': { name: 'QwelOS', type: 'folder', items: {
            'README.md': { name: 'README.md', type: 'file', extension: 'md' },
            'main.js': { name: 'main.js', type: 'file', extension: 'js' }
          } },
          'Aurora UI': { name: 'Aurora UI', type: 'folder', items: {
            'theme.css': { name: 'theme.css', type: 'file', extension: 'css' }
          } }
        }
      },
      System: {
        name: 'System',
        type: 'folder',
        items: {
          'settings.json': { name: 'settings.json', type: 'file', extension: 'json' },
          'kernel.log': { name: 'kernel.log', type: 'file', extension: 'log' }
        }
      }
    }
  }
}

const appCatalog = [
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '⌘',
    type: 'terminal',
    isOpen: false,
    isMinimized: false,
    isFullscreen: false,
    position: { x: 0, y: 0 },
    lines: [
      'root@qwelos:~# ./start-os.sh',
      'Loading desktop environment...',
      'Booting QwelOS shell',
      'Rendering wallpaper + app launcher...',
      'Ready.'
    ]
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: '◌',
    type: 'browser',
    isOpen: false,
    isMinimized: false,
    isFullscreen: false,
    position: { x: 0, y: 0 },
    currentPage: 'home',
    history: ['home'],
    historyIndex: 0
  },
  {
    id: 'files',
    title: 'Files',
    icon: '⌂',
    type: 'explorer',
    isOpen: false,
    isMinimized: false,
    isFullscreen: false,
    position: { x: 0, y: 0 },
    currentDir: 'Home',
    selected: null
  }
]

const appById = Object.fromEntries(appCatalog.map(app => [app.id, app]))

const getBrowserPage = (app) => browserPages[app.currentPage] || browserPages.home

const normalizeRoute = (value) => {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return 'home'
  if (trimmed === 'home' || trimmed === 'qwelos.local' || trimmed === 'qwelos.local/') return 'home'
  if (trimmed.includes('docs')) return 'docs'
  if (trimmed.includes('apps')) return 'apps'
  return 'home'
}

const navigateBrowser = (appId, rawInput) => {
  const app = appById[appId]
  if (!app || app.type !== 'browser') return

  const target = normalizeRoute(rawInput)
  const nextPage = browserPages[target]
  if (!nextPage) return

  app.currentPage = target
  app.history = [...new Set([...app.history, target])]
  app.historyIndex = app.history.indexOf(target)
  refreshAppWindow(appId)
}

const getExplorerNode = (path) => explorerTree[path] || explorerTree.Home

const refreshAppWindow = (appId) => {
  const existing = document.querySelector(`.window[data-app-id="${appId}"]`)
  if (!existing) return

  const app = appById[appId]
  const replacement = renderAppWindow(app)
  const parent = existing.parentNode
  parent.replaceChild(replacement, existing)
  focusWindow(appId)
}

const minimizeWindow = (appId) => {
  const app = appById[appId]
  const win = document.querySelector(`.window[data-app-id="${appId}"]`)

  if (!app || !win) return

  app.isMinimized = !app.isMinimized
  win.classList.toggle('minimized', app.isMinimized)
  win.style.display = app.isMinimized ? 'none' : ''

  if (!app.isMinimized) {
    focusWindow(appId)
  }
}

const toggleFullscreen = (appId) => {
  const app = appById[appId]
  const win = document.querySelector(`.window[data-app-id="${appId}"]`)

  if (!app || !win) return

  app.isFullscreen = !app.isFullscreen
  win.classList.toggle('fullscreen', app.isFullscreen)

  if (app.isFullscreen) {
    win.style.left = '10px'
    win.style.top = '10px'
    win.style.width = 'calc(100vw - 20px)'
    win.style.height = 'calc(100vh - 58px)'
    win.style.transform = 'none'
    return
  }

  win.style.width = ''
  win.style.height = ''
  const layerRect = win.parentElement.getBoundingClientRect()
  const width = win.offsetWidth || 520
  const height = win.offsetHeight || 300
  const x = Math.max(16, (layerRect.width - width) / 2)
  const y = Math.max(30, (layerRect.height - height) / 2)
  app.position = { x, y }
  win.style.left = `${x}px`
  win.style.top = `${y}px`
  win.style.transform = 'none'
  focusWindow(appId)
}

const renderAppWindow = (app) => {
  const windowEl = document.createElement('div')
  windowEl.className = 'window'
  windowEl.dataset.appId = app.id

  let bodyHtml = ''

  if (app.type === 'terminal') {
    bodyHtml = `
      <div class="window-body terminal-body">
        ${app.lines.map(line => `<div class="term-line">${line}</div>`).join('')}
      </div>
    `
  } else if (app.type === 'browser') {
    const page = getBrowserPage(app)
    const addressValue = page.url

    bodyHtml = `
      <div class="window-body browser-body">
        <div class="browser-toolbar">
          <button class="browser-nav" data-browser-action="back">←</button>
          <button class="browser-nav" data-browser-action="forward">→</button>
          <button class="browser-nav" data-browser-action="home">⌂</button>
          <input class="browser-address" value="${addressValue}" aria-label="Address bar" />
          <button class="browser-go" data-browser-action="go">Go</button>
        </div>
        <div class="browser-page">
          ${page.content}
        </div>
      </div>
    `
  } else if (app.type === 'explorer') {
    const currentNode = getExplorerNode(app.currentDir)
    const entries = Object.entries(currentNode.items || {})
    const explorerItems = ['Home', 'Home/Documents', 'Home/Downloads', 'Home/Projects', 'Home/System']

    bodyHtml = `
      <div class="window-body explorer-body">
        <aside class="explorer-sidebar">
          ${explorerItems.map((path) => {
            const folder = getExplorerNode(path)
            const selected = path === app.currentDir ? 'selected' : ''
            return `<button class="explorer-item ${selected}" data-explorer-path="${path}">${folder.name}</button>`
          }).join('')}
        </aside>
        <main class="explorer-main">
          <div class="explorer-header">
            <span>${currentNode.name}</span>
          </div>
          <div class="explorer-grid">
            ${entries.map(([name, entry]) => {
              const typeClass = entry.type === 'folder' ? 'folder' : 'file'
              const isSelected = app.selected === `${app.currentDir}/${name}` ? 'selected' : ''
              return `
                <button class="explorer-row ${typeClass} ${isSelected}" data-explorer-path="${app.currentDir === 'Home' ? `${app.currentDir}/${name}` : `${app.currentDir}/${name}`}" data-explorer-kind="${entry.type}">
                  <span class="explorer-icon">${entry.type === 'folder' ? '📁' : '📄'}</span>
                  <span>${name}</span>
                </button>
              `
            }).join('')}
          </div>
          <div class="explorer-preview">
            ${app.selected ? `<strong>Selected:</strong> ${app.selected.split('/').slice(-1)[0]}` : '<strong>No file selected</strong>'}
          </div>
        </main>
      </div>
    `
  }

  windowEl.innerHTML = `
    <div class="window-header">
      <div class="window-controls">
        <button class="win-button red" aria-label="Close ${app.title}"></button>
        <button class="win-button yellow" aria-label="Minimize ${app.title}"></button>
        <button class="win-button green" aria-label="Maximize ${app.title}"></button>
      </div>
      <div class="window-title">${app.title}</div>
      <div class="window-spacer"></div>
    </div>
    ${bodyHtml}
  `

  const controls = windowEl.querySelectorAll('.win-button')
  controls[0].addEventListener('click', () => closeWindow(app.id))
  controls[1].addEventListener('click', () => minimizeWindow(app.id))
  controls[2].addEventListener('click', () => toggleFullscreen(app.id))

  const header = windowEl.querySelector('.window-header')
  header.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.win-button')) return
    if (app.isFullscreen) return

    const layer = windowEl.parentElement
    const startX = event.clientX
    const startY = event.clientY
    const rect = windowEl.getBoundingClientRect()
    const offsetX = startX - rect.left
    const offsetY = startY - rect.top

    const onPointerMove = (moveEvent) => {
      event.preventDefault()
      const layerRect = layer.getBoundingClientRect()
      const nextLeft = moveEvent.clientX - offsetX - layerRect.left
      const nextTop = moveEvent.clientY - offsetY - layerRect.top
      const maxLeft = Math.max(8, layerRect.width - rect.width - 8)
      const maxTop = Math.max(8, layerRect.height - rect.height - 8)

      windowEl.style.left = `${Math.min(Math.max(nextLeft, 8), maxLeft)}px`
      windowEl.style.top = `${Math.min(Math.max(nextTop, 8), maxTop)}px`
      windowEl.style.transform = 'none'
      app.position = {
        x: parseFloat(windowEl.style.left),
        y: parseFloat(windowEl.style.top)
      }
    }

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
  })

  if (app.type === 'browser') {
    const input = windowEl.querySelector('.browser-address')
    const goButton = windowEl.querySelector('.browser-go')
    const navButtons = windowEl.querySelectorAll('.browser-nav')

    const handleNavigation = () => navigateBrowser(app.id, input.value)

    goButton.addEventListener('click', handleNavigation)
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') handleNavigation()
    })

    navButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.browserAction
        if (action === 'home') {
          navigateBrowser(app.id, 'home')
          return
        }

        if (action === 'back') {
          if (app.historyIndex > 0) {
            app.historyIndex -= 1
            app.currentPage = app.history[app.historyIndex]
            refreshAppWindow(app.id)
          }
        }

        if (action === 'forward') {
          if (app.historyIndex < app.history.length - 1) {
            app.historyIndex += 1
            app.currentPage = app.history[app.historyIndex]
            refreshAppWindow(app.id)
          }
        }
      })
    })
  }

  if (app.type === 'explorer') {
    const entries = windowEl.querySelectorAll('.explorer-row')
    entries.forEach((button) => {
      button.addEventListener('click', () => {
        const path = button.dataset.explorerPath
        const kind = button.dataset.explorerKind
        const node = getExplorerNode(path)

        if (kind === 'folder' && node) {
          app.currentDir = path
          app.selected = null
          refreshAppWindow(app.id)
          return
        }

        app.selected = path
        refreshAppWindow(app.id)
      })
    })

    const sideItems = windowEl.querySelectorAll('.explorer-item')
    sideItems.forEach((button) => {
      button.addEventListener('click', () => {
        app.currentDir = button.dataset.explorerPath
        app.selected = null
        refreshAppWindow(app.id)
      })
    })
  }

  windowEl.addEventListener('pointerdown', () => focusWindow(app.id))

  return windowEl
}

const showWindow = (appId) => {
  const existing = document.querySelector(`.window[data-app-id="${appId}"]`)
  const app = appById[appId]

  if (existing) {
    if (app.isMinimized) {
      app.isMinimized = false
      existing.classList.remove('minimized')
      existing.style.display = ''
    }
    focusWindow(appId)
    return
  }

  if (!app) return

  const layer = document.querySelector('.window-layer')
  const win = renderAppWindow(app)
  layer.appendChild(win)
  app.isOpen = true

  const layerRect = layer.getBoundingClientRect()
  const width = win.offsetWidth || 520
  const height = win.offsetHeight || 340
  const x = app.position.x || (layerRect.width - width) / 2
  const y = app.position.y || (layerRect.height - height) / 2

  win.style.left = `${Math.max(12, x)}px`
  win.style.top = `${Math.max(12, y)}px`
  win.style.transform = 'none'

  focusWindow(appId)
}

const closeWindow = (appId) => {
  const app = appById[appId]
  const win = document.querySelector(`.window[data-app-id="${appId}"]`)
  if (!win || !app) return

  app.isOpen = false
  app.isMinimized = false
  app.isFullscreen = false
  win.remove()
}

const focusWindow = (appId) => {
  const windows = [...document.querySelectorAll('.window')]
  windows.forEach((win) => {
    const active = win.dataset.appId === appId
    win.classList.toggle('focused', active)
    win.style.zIndex = active ? '20' : '10'
  })

  const dockButtons = document.querySelectorAll('.dock-icon')
  dockButtons.forEach((button) => {
    const active = button.dataset.app === appId
    button.classList.toggle('active', active)
    button.classList.toggle('open', active)
  })

  const taskbarApps = document.querySelectorAll('.taskbar-app')
  taskbarApps.forEach((button) => {
    const active = button.dataset.app === appId
    button.classList.toggle('active', active)
  })
}

const updateTaskbarState = () => {
  const center = document.querySelector('.taskbar-center')
  if (!center) return

  const openApps = [...document.querySelectorAll('.window')].map((win) => win.dataset.appId)
  const visible = new Set(openApps)

  center.innerHTML = ''

  if (!visible.size) {
    const placeholder = document.createElement('div')
    placeholder.className = 'taskbar-app inactive'
    placeholder.textContent = 'No apps open'
    center.appendChild(placeholder)
    return
  }

  appCatalog.forEach((app) => {
    if (!visible.has(app.id)) return

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'taskbar-app'
    button.dataset.app = app.id
    button.textContent = app.icon
    button.title = app.title
    button.addEventListener('click', () => {
      const win = document.querySelector(`.window[data-app-id="${app.id}"]`)
      if (win) {
        focusWindow(app.id)
      } else {
        showWindow(app.id)
      }
    })

    const activeWindow = document.querySelector('.window.focused')
    if (activeWindow && activeWindow.dataset.appId === app.id) {
      button.classList.add('active')
    }

    center.appendChild(button)
  })
}

const toggleStartMenu = () => {
  const menu = document.querySelector('.start-menu')
  const settings = document.querySelector('.quick-settings')
  menu.classList.toggle('visible')
  if (menu.classList.contains('visible')) {
    settings.classList.remove('visible')
  }
}

const closeStartMenu = () => {
  document.querySelector('.start-menu').classList.remove('visible')
}

const toggleQuickSettings = () => {
  const settings = document.querySelector('.quick-settings')
  const menu = document.querySelector('.start-menu')
  settings.classList.toggle('visible')
  if (settings.classList.contains('visible')) {
    menu.classList.remove('visible')
  }
}

const closeQuickSettings = () => {
  document.querySelector('.quick-settings').classList.remove('visible')
}

document.querySelector('#app').innerHTML = `
  <div class="desktop">
    <div class="desktop-glow"></div>
    <div class="desktop-noise"></div>

    <div class="desktop-icons">
      <button class="desktop-icon" data-app="browser">
        <span class="desktop-icon-graphic">◌</span>
        <span>Browser</span>
      </button>
      <button class="desktop-icon" data-app="files">
        <span class="desktop-icon-graphic">⌂</span>
        <span>Files</span>
      </button>
      <button class="desktop-icon" data-app="terminal">
        <span class="desktop-icon-graphic">⌘</span>
        <span>Terminal</span>
      </button>
    </div>

    <div class="window-layer"></div>

    <div class="start-menu">
      <div class="start-menu-search">
        <span>⌕</span>
        <input type="text" value="Search" aria-label="Search apps" />
      </div>

      <div class="start-menu-section">
        <div class="section-label">Pinned</div>
        <div class="start-menu-grid">
          <button class="start-menu-item" data-app="browser">
            <span class="menu-app-icon purple">◌</span>
            <span>Browser</span>
          </button>
          <button class="start-menu-item" data-app="files">
            <span class="menu-app-icon blue">⌂</span>
            <span>Files</span>
          </button>
          <button class="start-menu-item" data-app="terminal">
            <span class="menu-app-icon green">⌘</span>
            <span>Terminal</span>
          </button>
          <button class="start-menu-item" data-app="browser">
            <span class="menu-app-icon gold">◍</span>
            <span>Notes</span>
          </button>
          <button class="start-menu-item" data-app="files">
            <span class="menu-app-icon pink">▣</span>
            <span>Gallery</span>
          </button>
          <button class="start-menu-item" data-app="terminal">
            <span class="menu-app-icon cyan">⋯</span>
            <span>More</span>
          </button>
        </div>
      </div>

      <div class="start-menu-section compact">
        <div class="section-label">Recommended</div>
        <div class="start-menu-recommended">
          <div class="rec-item">
            <span class="rec-icon">◌</span>
            <div>
              <strong>Welcome to QwelOS</strong>
              <small>Recently opened</small>
            </div>
          </div>
          <div class="rec-item">
            <span class="rec-icon">⌂</span>
            <div>
              <strong>Project Files</strong>
              <small>Updated today</small>
            </div>
          </div>
        </div>
      </div>

      <div class="start-menu-footer">
        <button class="power-button">Power</button>
      </div>
    </div>

    <div class="quick-settings">
      <div class="qs-header">
        <div>
          <strong>Quick Settings</strong>
        </div>
        <button class="qs-close">✕</button>
      </div>

      <div class="qs-grid">
        <div class="qs-tile active"><span>Wi‑Fi</span><strong>Home</strong></div>
        <div class="qs-tile active"><span>Bluetooth</span><strong>On</strong></div>
        <div class="qs-tile"><span>Airplane</span><strong>Off</strong></div>
        <div class="qs-tile active"><span>Focus</span><strong>On</strong></div>
      </div>

      <div class="qs-slider-row">
        <span>Brightness</span>
        <div class="qs-slider"><span></span></div>
      </div>

      <div class="qs-slider-row">
        <span>Volume</span>
        <div class="qs-slider"><span></span></div>
      </div>

      <div class="qs-weather">
        <div>
          <small>Now</small>
          <strong>17°</strong>
        </div>
        <div class="weather-meta">
          <span>☀️</span>
          <small>Clear sky</small>
        </div>
      </div>
    </div>

    <div class="dock">
      <button class="dock-icon active" data-app="terminal">⌘</button>
      <button class="dock-icon" data-app="browser">◌</button>
      <button class="dock-icon" data-app="files">⌂</button>
    </div>

    <div class="taskbar">
      <button class="start-button">Start</button>
      <div class="taskbar-center"></div>
      <div class="taskbar-tray">
        <span>⚙</span>
        <span>🔊</span>
        <button class="taskbar-time">10:45</button>
      </div>
    </div>
  </div>
`

updateTaskbarState()

const startButton = document.querySelector('.start-button')
startButton.addEventListener('click', (event) => {
  event.stopPropagation()
  toggleStartMenu()
})

const quickSettingsButton = document.querySelector('.taskbar-time')
quickSettingsButton.addEventListener('click', (event) => {
  event.stopPropagation()
  toggleQuickSettings()
})

document.querySelector('.qs-close').addEventListener('click', (event) => {
  event.stopPropagation()
  closeQuickSettings()
})

document.addEventListener('click', (event) => {
  const inMenu = event.target.closest('.start-menu')
  const inStart = event.target.closest('.start-button')
  const inQuickSettings = event.target.closest('.quick-settings')
  const inTime = event.target.closest('.taskbar-time')
  if (!inMenu && !inStart) closeStartMenu()
  if (!inQuickSettings && !inTime) closeQuickSettings()
})

for (const selector of ['.desktop-icon', '.dock-icon', '.start-menu-item']) {
  document.querySelectorAll(selector).forEach((button) => {
    button.addEventListener('click', (event) => {
      const appId = button.dataset.app
      showWindow(appId)
      closeStartMenu()
      closeQuickSettings()
      event.stopPropagation()
    })
  })
}

showWindow('browser')
updateTaskbarState()


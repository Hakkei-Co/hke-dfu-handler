import { XMLParser } from 'fast-xml-parser'
import './style.css'

interface INode {
  name: string
  path: string
  children?: INode[]
}

function createTree (paths: string[]): INode {
  const map: { [key: string]: INode } = {}
  for (const path of paths) {
    const parts = path.split('/').filter(Boolean)
    let currentNode = map['']
    if (!currentNode) {
      currentNode = { name: '', path: '', children: [] }
      map[''] = currentNode
    }
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      let childNode = currentNode.children?.find(x => x.name === part)
      if (!childNode) {
        childNode = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          children: []
        }
        currentNode.children?.push(childNode)
      }
      currentNode = childNode
    }
  }
  return map['']
}

interface Options {
  hidden: boolean
  indent: boolean
}

function addToDom (
  root: INode,
  parent: HTMLElement,
  { hidden = false, indent = false }: Partial<Options> = {}
): HTMLElement {
  const ul = document.createElement('ul')
  ul.classList.add('list-none', 'flex', 'flex-col')
  if (indent) ul.classList.add('ml-5')
  hidden && ul.classList.add('hidden')
  for (const child of root.children || []) {
    const li = document.createElement('li')
    li.classList.add('py-1')
    const span = document.createElement('span')
    span.textContent = child.name
    span.classList.add('flex', 'justify-between', 'gap-3', 'px-3', 'py-1')
    if (child.children && child.children.length > 0) {
      span.classList.add('bg-gray-200', 'cursor-pointer')
      const toggle = document.createElement('span')
      toggle.className = 'icon font-bold'
      toggle.textContent = '[+]'
      span.appendChild(toggle)
      li.appendChild(span)
      const _childNode = addToDom(child, li, { hidden: true, indent: true })
      span.addEventListener('click', () => {
        _childNode.classList.toggle('hidden')
        toggle.textContent = _childNode.classList.contains('hidden')
          ? '[+]'
          : '[-]'
      })
    } else {
      const a = document.createElement('a')
      a.className = 'cursor-pointer'

      // NOTE: Request
      a.onclick = async () => {
        const blob = await fetch(
          `https://artifacts.sfo3.hakkei.net/${child.path}`
        ).then(res => res.blob())
        const file = new File([blob], child.name)
        console.log(file)
      }

      a.appendChild(span)
      span.classList.add('bg-gray-100')
      li.appendChild(a)
    }
    ul.appendChild(li)
  }
  parent.appendChild(ul)
  return ul
}

class FileTree extends HTMLElement {
  constructor () {
    super()
    this.innerHTML = `<div class="flex flex-col gap-10 border-2 p-5"></div>`
    this.initTree()
  }

  async initTree () {
    const xml = await fetch(
      'https://hakkei-artifacts.sfo3.digitaloceanspaces.com/&prefix=hakkei-development'
    ).then(res => {
      console.log('%c NOTICE ⏰ ', 'background:#6e6e6e; color: #cdfdce;, ⚛︎ FileTree ⚛︎ initTree ⚛︎ res', res);

      return res.text()
    })
    const parser = new XMLParser()
    const paths = parser
      .parse(xml)
      ['ListBucketResult']['Contents'].filter(({ Key }: { Key: string }) =>
        Boolean(Key)
      )
      .map(({ Key }: { Key: string }) => Key.trim())
    const root = createTree(paths)
    addToDom(root, this.children[0] as HTMLElement)
  }
}

customElements.define('dfu-handler', FileTree)

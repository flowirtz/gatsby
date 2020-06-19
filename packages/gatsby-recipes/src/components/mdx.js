import React from 'react'
import { transform } from '@babel/standalone'
import mdx from '@mdx-js/mdx'
import { mdx as createElement, MDXProvider } from '@mdx-js/react'
import babelPluginTransformReactJsx from '@babel/plugin-transform-react-jsx'
import babelPluginRemoveExportKeywords from 'babel-plugin-remove-export-keywords'

const transformJsx = jsx => {
  const { code } = transform(jsx, {
    plugins: [
      babelPluginRemoveExportKeywords,
      [babelPluginTransformReactJsx, { useBuiltIns: true }],
    ],
  })

  return code
}

const transformCodeForEval = jsx => {
  return `${jsx}

  return React.createElement(MDXProvider, { components },
    React.createElement(MDXContent, props)
  );`
}

export default ({ children: mdxSrc, scope, components, ...props }) => {
  const fullScope = {
    mdx: createElement,
    MDXProvider,
    React,
    components,
    props,
    ...scope
  }
  const scopeKeys = Object.keys(fullScope)
  const scopeValues = Object.values(fullScope)

  const jsxFromMdx = mdx.sync(mdxSrc, { skipExport: true })
  const srcCode = transformJsx(jsxFromMdx)

  const fn = new Function(...scopeKeys, transformCodeForEval(srcCode))

  return fn(...scopeValues)
}

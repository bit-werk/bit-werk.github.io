import katex from 'katex'

// Render a LaTeX string. Use `block` for a centered display equation.
// Tip: pass the formula with String.raw`...` so backslashes stay literal.
export function Tex({ children, block = false }) {
  const html = katex.renderToString(String(children), {
    throwOnError: false,
    displayMode: block,
  })
  const Tag = block ? 'div' : 'span'
  return (
    <Tag
      className={block ? 'tex-block' : 'tex'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default Tex

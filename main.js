import 'codemirror/lib/codemirror.css'
import CodeMirror from 'codemirror'
import 'codemirror/addon/display/placeholder'
import './style.css'
import { createIntlSegmenterPolyfill } from 'intl-segmenter-polyfill';
import break_iterator from './break_iterator_km.wasm?url';

async function main() {

  const buttonCopy = document.getElementById('button-copy')
  const Segmenter = await createIntlSegmenterPolyfill(fetch(break_iterator))
  const segmenter = new Segmenter('km', { granularity: 'word' })
  const inputEditor = createEditor('input');
  const outputEditor = createEditor('output');

  function transform(value) {

    const regex = /[\u1780-\u17FF]+/gm

    let data = value.replace(/[\u200b]/gm, '');
    let result;    
  
    while(result = regex.exec(data)) {
      const original = result[0];
      const out = segmenter.segment(original).map(i => i.segment).join('\u200b');
      data = data.replace(original, out)
    }

    return data;
  }
  
  inputEditor.on('change', (instance, change) => {
    const value = instance.getValue();
    outputEditor.setValue(transform(value))
  })

  buttonCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(outputEditor.getValue());
  })

  document.body.classList.remove('loading');
}

function createEditor(id) {
  const editor = CodeMirror.fromTextArea(document.getElementById(id), {
    lineNumbers: false,
    lineWrapping: true,
  });
  editor.setSize(415, 200)
  return editor;

}



main();
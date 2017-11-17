const React = require('react');
const { Editor, EditorState, convertToRaw, convertFromRaw, Entity, Modifier, CompositeDecorator } = require('draft-js');

const styles = {
  editor: {
    border: '1px solid gray',
    minHeight: 300,
    cursor: 'text'
  },
  placeholder: {
    display: 'inline-block',
    background: 'lightBlue',
    padding: '0 3px',
  }
};

const Placeholder = props => {
  const {
    contentState,
    decoratedText,
    entityKey,
    offsetKey,
    ...passedInProps,
  } = props;
  return <span {...passedInProps} style={styles.placeholder}>
    <span className="fa fa-filter"/>
    {props.children}
  </span>;
};

const decorator = new CompositeDecorator([
  {
    strategy: findPlaceholders,
    component: Placeholder
  },
  {
    strategy: filterIconStrategy,
    component: FilterIconSpan,
  }
]);

const FilterIconSpan = () => (
  <span className="fa fa-filter"/>
);

const FILTER_ICON_REGEX = /\uf0b0/g;

function filterIconStrategy(contentBlock, callback, contentState) {
  findWithRegex(FILTER_ICON_REGEX, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

function findPlaceholders(contentBlock, callback) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && Entity.get(entityKey).getType() === 'FILTER';
  }, callback);
}

class Editor2 extends React.Component {
  state = {
    editorState: EditorState.createEmpty(decorator)
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.logState = this.logState.bind(this);
    this.insertPlaceholder = this.insertPlaceholder.bind(this);
    this.insertSpace = this.insertSpace.bind(this);
    this.focus = this.focus.bind(this);
  }

  onChange(editorState) {
    this.setState({ editorState });
  }

  logState() {
    const content = this.state.editorState.getCurrentContent();
    console.log(convertToRaw(content));
  }

  insertPlaceholder(label, meta) {
    const editorState = this.state.editorState;
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const entityKey = Entity.create('FILTER', 'MUTABLE', { meta });
    const textWithEntity = Modifier.insertText(currentContent, selection, label, null, entityKey);
    // const newEditorState = EditorState.push(editorState, textWithEntity, 'insert-filter');

    // const withSpace = Modifier.insertText(textWithEntity, editorState.getSelection(), ' ');

    this.setState(
      {
        editorState: EditorState.push(editorState, textWithEntity, 'insert-filter')
      },
      () => {
        this.focus();
      this.insertSpace();
    
      }
    );

  }

  insertSpace() {
    const editorState = this.state.editorState;
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContentState = Modifier.insertText(currentContent, selection, ' ');

    this.setState(
      {
        editorState: EditorState.push(editorState, newContentState, 'insert-space')
      },
      () => {
        this.focus();
      }
    );
  }

  focus() {
    this.refs.editor.focus();
  }

  render() {
    return (
      <div>
        <button type="button" onClick={this.insertPlaceholder.bind(null, 'filter', { filterDef: {d: 'whatever'}})}>
          Insert Filter
        </button>
        <div style={styles.editor} onClick={this.focus}>
          <Editor editorState={this.state.editorState} ref="editor" onChange={this.onChange} />
        </div>
        <button type="button" onClick={this.logState}>
          Log
        </button>
      </div>
    );
  }
}
export default Editor2;

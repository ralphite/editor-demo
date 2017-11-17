import React, { Component } from 'react';
import { EditorState, RichUtils, convertToRaw, Modifier, Entity } from 'draft-js';
import Editor from 'draft-js-plugins-editor';

import createEmojiPlugin from 'draft-js-emoji-plugin';
import createMentionPlugin, { defaultSuggestionsFilter } from './draft-js-plugins/draft-js-mention-plugin/src/index';
import mentions from './mentions';

import { filterDef, filterDecorator } from './Filter';

import 'draft-js/dist/Draft.css';
import 'draft-js-emoji-plugin/lib/plugin.css';
import './Editor.css';

const mentionPlugin = createMentionPlugin();
const { MentionSuggestions } = mentionPlugin;
const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions, EmojiSelect } = emojiPlugin;

class CollabEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(filterDecorator),
      suggestions: mentions
    };

    this.focus = () => this.editor.focus();
    this.onChange = editorState => this.setState({ editorState });

    this.handleKeyCommand = command => this._handleKeyCommand(command);
    this.onTab = e => this._onTab(e);
    this.toggleBlockType = type => this._toggleBlockType(type);
    this.toggleInlineStyle = style => this._toggleInlineStyle(style);

    this.logState = () => console.log(this.state.editorState.toJS());
    this.insertFilter = this._insertFilter.bind(this);

    this.getCurrentContent = () => {
      const content = this.state.editorState.getCurrentContent();
      console.log(convertToRaw(content));
    };
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _onTab(e) {
    const maxDepth = 4;
    this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
  }

  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
  }

  _insertFilter(e) {
    e.preventDefault();
    const editorState = this.state.editorState;
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const entityKey = Entity.create('FILTER', 'MUTABLE', { filterData: filterDef });
    const textWithEntity = Modifier.insertText(currentContent, selection, ' filter', null, entityKey);
    const contentStateEndWithSpace = Modifier.insertText(textWithEntity, selection, ' ')

    // EditorState.push(editorState, textWithEntity, 'insert-filter');
    

    this.setState(
      {
        editorState: EditorState.push(editorState, contentStateEndWithSpace, 'insert-filter')
      },
      () => {
        this.focus();
      }
    );

    // const { editorState } = this.state;
    // const contentState = editorState.getCurrentContent();    
    // const newContentState = Modifier.insertText(contentState, editorState.getSelection(), 'filter');
    

    // const newContentStateWithEntity = newContentState.createEntity('FILTER', 'MUTABLE', { filterData: filterDef });
    // const entityKey = newContentStateWithEntity.getLastCreatedEntityKey();

    // const newEditorState = EditorState.set(editorState, { currentContent: newContentStateWithEntity });
    
    // this.setState(
    //   {
    //     editorState: EditorState.set(newEditorState, { currentContent: newContentStateWithEntity }),
    //   },
    //   () => {
    //     setTimeout(() => this.editor.focus(), 0);
    //   }
    // );

    // console.log('Inserted filter', filterDef);
  }

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions)
    });
  };

  onAddMention = () => {
    // get the mention object selected
  };

  render() {
    const { editorState } = this.state;

    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor mb-3 ';
    var contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        className += ' RichEditor-hidePlaceholder';
      }
    }

    return (
      <div className="RichEditor-root my-5">
        <div>
          <div className="mb-3">
            <BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType} />
            <InlineStyleControls editorState={editorState} onToggle={this.toggleInlineStyle} />
          </div>
          <div className={className} onClick={this.focus}>
            <Editor
              blockStyleFn={getBlockStyle}
              customStyleMap={styleMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              onChange={this.onChange}
              onTab={this.onTab}
              ref={element => {
                this.editor = element;
              }}
              spellCheck={true}
              plugins={[mentionPlugin, emojiPlugin]}
            />
            <div className="MentionSuggestions">
              <MentionSuggestions
                onSearchChange={this.onSearchChange}
                suggestions={this.state.suggestions}
                onAddMention={this.onAddMention}
              />
            </div>
            <EmojiSuggestions />
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-12">
            <div className="p-1">
              <button
                className="RichEditor-button log-state btn btn-sm btn-info ml-3 mb-3 float-right"
                style={{ cursor: 'pointer' }}
                onClick={this.getCurrentContent}
              >
                Log Raw Content
              </button>
              <button
                className="RichEditor-button log-state btn btn-sm btn-info ml-3 mb-3 float-right"
                style={{ cursor: 'pointer' }}
                onClick={this.logState}
              >
                Log Editor State
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
}

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'Code Block', style: 'code-block' }
];

const BlockStyleControls = props => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <span className="RichEditor-controls">
      {BLOCK_TYPES.map(type => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </span>
  );
};

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' }
];

const InlineStyleControls = props => {
  var currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <span className="RichEditor-controls">
      {INLINE_STYLES.map(type => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </span>
  );
};

export default CollabEditor;

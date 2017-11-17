import React from 'react';
import { CompositeDecorator, Entity } from 'draft-js';

export const filterDef = {
  filter: {
    prop: 'whatever value for the current filter'
  }
};

export const EmbeddedFilterComponent = ({children}) => (
  <span className="embeddedFilterComponent">
    <span className="fa fa-filter"></span>  
    {children}
  </span>
);

export const filterDecorator = new CompositeDecorator([
  {
    strategy: getFilterStartegy,
    component: EmbeddedFilterComponent,
  }
]);

function getFilterStartegy(contentBlock, callback, contentState) { 
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && Entity.get(entityKey).getType() === 'FILTER';
  }, callback);
}
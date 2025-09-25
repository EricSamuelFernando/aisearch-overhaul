export const applyChanges = (model1: any, model2: any) => {
  const model2Keys = Object.keys(model2);
  const model1Keys = Object.keys(model1);
  const changedFields = model1Keys.filter((key) => {
    return model1[key] !== model2[key];
  });
  const newModel = { ...model2 };
  changedFields.forEach((field) => {
    if (Array.isArray(model1[field]) && Array.isArray(model2[field])) {
      newModel[field] = [...model1[field]];
    } else if (
      typeof model1[field] === 'object' &&
      typeof model2[field] === 'object'
    ) {
      newModel[field] = applyChanges(model1[field], model2[field]);
    } else {
      newModel[field] = model1[field];
    }
  });
  return newModel;
};

export const parseJson = (jsonString) => {
  try {
    const data = JSON.parse(jsonString)
    const { title, metaDescription, postContent } = data
    return { title, metaDescription, postContent, error: null }
  } catch (err) {
    return {
      title: '',
      metaDescription: '',
      postContent: jsonString,
      error: 'Ошибка при парсинге JSON: ' + err.message,
    }
  }
}

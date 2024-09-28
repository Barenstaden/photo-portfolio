export const fixComments = async () =>  {
  const oldUrl = 'http://161.35.212.50/s';
  const newUrl = 'https://oyvindbjornstad.no/api'
  const oldComments = await $fetch(`${oldUrl}/comments?_limit=300`);
  const {data: newComments} = await $fetch(`${newUrl}/comments?filters[name][$eq]=&pagination[limit]=300&populate=*`);
  console.log(newComments)

  const {data: newImages} = await $fetch(`${newUrl}/images?pagination[start]=100&pagination[limit]=400&populate[0]=image&populate[1]=comments`)
  for await (const comment of newComments) {
      await $fetch(`${newUrl}/comments/${comment.documentId}`, {
        method: 'put',
        body: JSON.stringify({
          data: {
            name: 'Øyvind'
          }
        })
      })
  }


  // for await (const oldComment of oldComments) {
  //   const commentMatch = newComments.find(({comment}) => {
  //     return comment === oldComment.comment;
  //   })
  //   if (!commentMatch) continue
  //
  //   const imageMatch = newImages.find(({image}) => {
  //     return image.name === oldComment.image.image.name
  //   })
  //
  //   if (!imageMatch) continue
  //
  //   console.log(imageMatch)
  //   await $fetch(`${newUrl}/images/${imageMatch.documentId}`, {
  //     method: 'put',
  //     body: JSON.stringify({
  //       data: {
  //         comments: {
  //           connect: commentMatch.documentId
  //         }
  //       }
  //     })
  //   })

  // }

}

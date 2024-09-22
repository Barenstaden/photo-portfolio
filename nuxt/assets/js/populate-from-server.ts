export const populate = async () => {

  const oldAlbums = await $fetch('http://161.35.212.50/s/albums');

  for await (const album of oldAlbums) {
    const newAlbum = {
      title: album.title,
      description: album.description,
      images: []
    }

    const newImageArray = [];
    for await (const image of album.images) {

      const uploadedImage = await fetch('http://161.35.212.50/s/' + image.image.image.url, { signal: AbortSignal.timeout(20000) }).then(response => response.blob())
        .then((blob => {
          const formData = new FormData();
          formData.append('files', blob, image.image.image.name); // 'files' er Strapi's forventede form

          // Last opp bildet til Strapi
          return fetch(`/api/upload`, {
            method: 'POST',
            body: formData
          }).then(res => res.json())
        }))
      const newImage = {
        title: image.image.title,
        description: image.image.description,
        image: uploadedImage[0].id
      }
      const {data} = await fetch(`/api/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // VIKTIG: Angir at du sender JSON-data
        },
        body: JSON.stringify({data: newImage})
      }).then(res => res.json())

      const imageData = await $fetch('http://161.35.212.50/s/images/' + image.image.id);
      for await (const comment of imageData.comments) {
        console.log(comment)
        await $fetch('/api/comments', {
          method: 'POST',
          body: JSON.stringify({
            data: {
              createdAt: comment.createdAt,
              comment: comment.comment,
              name: comment.name,
              image: data.id
            }
          })
        })
      }
      newImageArray.push(data.id);
    }
    newAlbum.images = newImageArray;

    const albumRes = await fetch(`/api/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // VIKTIG: Angir at du sender JSON-data
      },
      body: JSON.stringify({data: newAlbum})
    }).then(res => res.json())

    console.log('ferdig')
  }
}

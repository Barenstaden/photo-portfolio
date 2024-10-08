export const populate = async () => {
  const url = '';
  const oldAlbums: [] = await $fetch('http://161.35.212.50/s/albums');

  for await (const album of oldAlbums) {
    const newAlbum = {
      title: album.title,
      description: album.description,
      images: []
    }

    const newImageArray = [];
    for await (const image of album?.images) {

      const uploadedImage = await fetch('http://161.35.212.50/s/' + image.image.image.url, { signal: AbortSignal.timeout(20000) }).then(response => response.blob())
        .then((async blob => {
          const formData = new FormData();
          formData.append('files', blob, image.image.image.name); // 'files' er Strapi's forventede form

          // Last opp bildet til Strapi
          const res = await fetch(`${url}/api/upload`, {
            method: 'POST',
            body: formData
          });
          return await res.json();
        }))
      const newImage = {
        title: image.image.title,
        description: image.image.description,
        image: uploadedImage[0].id
      }
      const {data} = await fetch(`${url}/api/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // VIKTIG: Angir at du sender JSON-data
        },
        body: JSON.stringify({data: newImage})
      }).then(res => res.json())

      const imageData = await $fetch('http://161.35.212.50/s/images/' + image.image.id);
      for await (const comment of imageData?.comments) {
        console.log(comment)
        await $fetch(`${url}/api/comments`, {
          method: 'POST',
          body: JSON.stringify({
            data: {
              comment: comment.comment,
              name: comment.name,
              image: {set: data.id}
            }
          })
        })
      }
      newImageArray.push(data.id);
    }
    newAlbum.images = {set: newImageArray};
    newAlbum.cover = {set: newImageArray[0]}

    const albumRes = await fetch(`${url}/api/albums`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // VIKTIG: Angir at du sender JSON-data
      },
      body: JSON.stringify({data: newAlbum})
    }).then(res => res.json())

    console.log('ferdig')
  }
}

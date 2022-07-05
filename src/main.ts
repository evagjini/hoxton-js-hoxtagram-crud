// solution goes here
type CommentData = {
    id: number
    content: string
    imageId: number
  }
  
  type Image = {
    id: number
    title: string
    likes: number
    image: string
    comments: CommentData[]
  }
  
  type State = {
    images: Image[]
  }
  
  let state: State = {
    images: []
  }
  
  // Q: What images do I have? state.images
  function getImagesFromServer () {
    fetch('http://localhost:3000//images')
      .then(resp => resp.json())
      .then(imagesFromServer => {
        state.images = imagesFromServer.reverse()
        render()
      })
  }




  function updateImage (image) {
    let imageCopy = { ...image }
    delete imageCopy.comments
    return fetch(`http://localhost:3000/images/${image.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(imageCopy)
    })
  }

  function createImage (title: string, image: string) {
    fetch ('http://localhost:3000/images',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          image,
          likes: 0
        })
      }).then(() => getImagesFromServer())
    }

    function deleteImage (imageId: number) {
        fetch(`http://localhost:3003/images/${imageId}`, {
          method: 'DELETE'
        }).then(() => getImagesFromServer())
      }

      function createComment (content: string, imageId: number) {
        fetch('comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            imageId
          })
        })
          .then(resp => resp.json())
          .then(newComment => {
            // // Surgical update - cheaper
            // let image = state.images.find(image => image.id === newComment.imageId)
            // image?.comments.push(newComment)
            // render()
      
            // Get everything again - more expensive, but we always get the latest data
     
            getImagesFromServer()
          })
      }


      function createComment (content: string, imageId: number) {
        fetch('http://localhost:3000/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            imageId
          })
        })
          .then(resp => resp.json())
          .then(newComment => {
            // // Surgical update - cheaper
            // let image = state.images.find(image => image.id === newComment.imageId)
            // image?.comments.push(newComment)
            // render()
      
            // Get everything again - more expensive, but we always get the latest data
            getImagesFromServer()
          })
      }


      function deleteComment (commentId: number) {
        fetch(`http://localhost:3000/comments/${commentId}`, {
          method: 'DELETE'
        }).then(() => {
          getImagesFromServer()
        })
      }

      function renderComment (comment: CommentData, commentsUl: HTMLUListElement) {
        let commentLi = document.createElement('li')
        commentLi.className = 'comment'
      
        let commentSpan = document.createElement('span')
        commentSpan.textContent = comment.content
      
        let deleteButton = document.createElement('button')
        deleteButton.className = 'comment-button'
        deleteButton.textContent = '🗑️'
        deleteButton.addEventListener('click', function () {
          deleteComment(comment.id)
        })
      
        commentLi.append(commentSpan, deleteButton)
      
        commentsUl.append(commentLi)
      }
      
      function renderCommentForm (imageId: number, articleEl: HTMLElement) {
        let addCommentForm = document.createElement('form')
        addCommentForm.className = 'comment-form'
        addCommentForm.addEventListener('submit', function (event) {
          event.preventDefault()
          createComment(commentInput.value, imageId)
        })
        let commentInput = document.createElement('input')
  commentInput.className = 'comment-input'
  commentInput.type = 'text'
  commentInput.name = 'comment'
  commentInput.placeholder = 'Add a comment...'

  let submitButton = document.createElement('button')
  submitButton.className = 'comment-button'
  submitButton.type = 'submit'
  submitButton.textContent = 'Post'

  addCommentForm.append(commentInput, submitButton)
  articleEl.append(addCommentForm)
}

function renderImage (image: Image, imageContainer: HTMLElement) {
  let articleEl = document.createElement('article')
  articleEl.className = 'image-card'

  let topSection = document.createElement('div')
  topSection.className = 'image__top-section'

  let titleEl = document.createElement('h2')
  titleEl.className = 'title'
  titleEl.textContent = image.title

  let deletePostButton = document.createElement('button')
  deletePostButton.className = 'image__delete-button'
  deletePostButton.textContent = '⨉'
  deletePostButton.addEventListener('click', function () {
    deleteImage(image.id)
  })
  topSection.append(titleEl, deletePostButton)

  let imgEl = document.createElement('img')
  imgEl.className = 'image'
  imgEl.src = image.image

  let likesSection = document.createElement('div')
  likesSection.className = 'likes-section'

  let likesSpan = document.createElement('span')
  likesSpan.className = 'likes'
  likesSpan.textContent = `${image.likes} likes`

  let likeBtn = document.createElement('button')
  likeBtn.className = 'like-button'
  likeBtn.textContent = '♥'
  likeBtn.addEventListener('click', function () {
    // updating state
    image.likes++

    // updating the server
    updateImage(image)

    // updating the page
    render()
  })

  let commentsUl = document.createElement('ul')
  commentsUl.className = 'comments'

  for (let comment of image.comments.slice(-5)) {
    renderComment(comment, commentsUl)
  }

  likesSection.append(likesSpan, likeBtn)
  articleEl.append(topSection, imgEl, likesSection, commentsUl)

  renderCommentForm(image.id, articleEl)

  imageContainer.append(articleEl)
}
function render () {
    let imageContainer = document.querySelector<HTMLElement>('.image-container')
    if (imageContainer === null) return
    imageContainer.textContent = ''
  
    for (let image of state.images) {
      renderImage(image, imageContainer)
    }
  }
  
  function listenToNewPostForm () {
    let newPostForm = document.querySelector<HTMLFormElement>('.new-post-form')
    newPostForm?.addEventListener('submit', function (event) {
      event.preventDefault()
      if (newPostForm === null) return
  
      // @ts-ignore
      createImage(newPostForm.title.value, newPostForm.image.value)
  
      newPostForm.reset()
    })
  }
  
  listenToNewPostForm()
  getImagesFromServer()
  render()
  
  
  // FEATURE: Deleting a post 🎉
  // add an X button to the top right of the post ✅
  // when you click on the X button: ✅
  // delete the post from the server ✅
  // update state and rerender ✅
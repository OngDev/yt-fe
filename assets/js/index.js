let checkClickMostNew = 0
let checkClickPlaylist = 0

function generateSuccessHTMLOutput(response) {
  return '<h4>Result</h4>' +
    '<h5>Status:</h5> ' +
    '<pre>' + response.status + '</pre>' +
    '<h5>Headers:</h5>' +
    '<pre>' + 'method: ' + JSON.stringify(response.config.method) +
    ' - url: ' + JSON.stringify(response.config.url, null, '\t') + '</pre>' +
    '<h5>Data:</h5>' +
    '<pre>' + JSON.stringify(response.data, null, '\t') + '</pre>';
}

function generateErrorHTMLOutput(error) {
  return '<h4>Result</h4>' +
    '<h5>Message:</h5> ' +
    '<pre>' + error.message + '</pre>' +
    '<h5>Status:</h5> ' +
    '<pre>' + error.status + '</pre>';
}

async function getVideos(clear) {
  try {
    var resultElement = document.getElementById('resultVideos');
    if (clear) {
      resultElement.innerHTML = ""
    } else {
      const skip = document.getElementById('skip').value;
      const limit = document.getElementById('limit').value;
      const playlistId = document.getElementById('playlistId').value;
      const params = { skip, limit, playlistId }
      if (!skip) {
        alert('skip required!')
        return
      }
      if (!limit) {
        alert('limit required!')
        return
      }

      const response = await axios.get("http://localhost:3004/api/videos", {
        params: params,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 500 || response.status === 406) {
        resultElement.innerHTML = generateErrorHTMLOutput(response)
      } else {
        resultElement.innerHTML = generateSuccessHTMLOutput(response)
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getVideoId(clear) {
  try {
    var resultElement = document.getElementById('resultVideoId');
    if (clear) {
      resultElement.innerHTML = ""
    } else {
      const videoId = document.getElementById('videoId').value;
      if (!videoId) {
        alert('videoId required!')
        return
      }

      const response = await axios.get(`http://localhost:3004/api/videos/${videoId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.status === 500 || response.status === 406) {
        resultElement.innerHTML = generateErrorHTMLOutput(response)
      } else {
        resultElement.innerHTML = generateSuccessHTMLOutput(response)
      }
    }
  } catch (error) {
    console.log(error);
  }
}

document.getElementById("mostnew").onclick = async function () {
  // const withIFrame = document.getElementById('iframeVideo').offsetWidth;
  // document.getElementById("iframeVideo").style.height = (withIFrame * 3 / 4) + "px";
  // table-mostnew
  try {
    if (checkClickMostNew === 0) {
      console.log('=====>checkClickMostNew: ', checkClickMostNew);
      const videosNew = await getVideos();
      if (videosNew && videosNew.status === 200) {
        let dataTableString = ""
        for (let index = 0; index < videosNew.data.data.length; index++) {
          const video = videosNew.data.data[index];
          const videoId = video.id
          dataTableString += `<tr onclick="clickVideoDetail('${videoId}')">
                              <td><img src="${video.thumbnails[0].url}"></td>
                              <td>${video.title}</td>
                              <td>${video.publishedAt}</td>
                            </tr>`
        }
        $('#table-mostnew tbody').append(dataTableString)
        checkClickMostNew = 1
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function firstLoad() {
  try {
    const topViews = await getVideosMostView()
    if (topViews && topViews.status === 200) {
      let dataTableString = ""
      for (let index = 0; index < topViews.data.data.length; index++) {
        const video = topViews.data.data[index];
        const videoId = video.id
        dataTableString += `<tr onclick="clickVideoDetail('${videoId}')">
                              <td><img src="${video.thumbnails[0].url}"></td>
                              <td>${video.title}</td>
                              <td>${video.statistics.viewCount} views</td>
                            </tr>`
      }
      $('#table-mostviews tbody').append(dataTableString)
    }
  } catch (error) {
    console.log(error);
  }
}

async function getVideosMostView() {
  try {
    const response = await axios.get("http://localhost:3004/api/videos/topview", {
      params: {
        videoNumber: 30
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response
  } catch (error) {
    console.log(error);
    return null
  }
}

async function getVideos(playlistId = null) {
  try {
    const response = await axios.get("http://localhost:3004/api/videos", {
      params: {
        skip: 0,
        limit: 30,
        playlistId
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response
  } catch (error) {
    console.log(error);
    return null
  }
}

function clickVideoDetail(id) {
  document.getElementById("iframeVideo").src = `https://www.youtube.com/embed/${id}`
}

// menu3
document.getElementById("playlist").onclick = async function () {
  try {
    if (checkClickPlaylist === 0) {
      const playlists = await getPlaylist()
      const playlistsData = playlists.data.data
      if (playlists) {
        const playlistFirst = playlistsData[0].id
        const videosInPlaylist = await getVideos(playlistFirst)
        let dataPlaylistString = ""
        for (let index = 0; index < playlistsData.length; index++) {
          const playlist = playlistsData[index];
          dataPlaylistString +=
            `<div class="panel panel-default">
            <div class="panel-heading">
              <h4 class="panel-title">
                <a data-toggle="collapse" data-parent="#accordion" href="#collapse${index}">${playlist.title}</a>
              </h4>
            </div>
            <div id="collapse${index}" class="panel-collapse collapse">
            </div>
          </div>`
        }
        $('#data-collapse').append(dataPlaylistString)
        $('#collapse0').attr('class', 'panel-collapse collapse in')
        $('#collapse0').html(`
        <div class="tablescroll" id="id-tablescroll">
          <table class="table table-striped" id="table-playlist0">
            <tbody>
            </tbody>
          </table>
        </div>
          `)

        if (videosInPlaylist.data.data.length < 4) {
          document.getElementById("id-tablescroll").style.overflowY = "hidden";
          document.getElementById("id-tablescroll").style.height = videosInPlaylist.data.data.length * 120 + "px";
        }
        let dataVideoString = ""
        for (let videoIndex = 0; videoIndex < videosInPlaylist.data.data.length; videoIndex++) {
          const video = videosInPlaylist.data.data[videoIndex];
          const videoId = video.id

          dataVideoString += `<tr onclick="clickVideoDetail('${videoId}')">
                              <td><img src="${video.thumbnails[0].url}"></td>
                              <td>${video.title}</td>
                              <td>${video.publishedAt}</td>
                            </tr>`
        }
        $('#table-playlist0 tbody').append(dataVideoString)

        for (let index = 1; index < playlistsData.length; index++) {
          const playList = playlistsData[index];
          const videosInPlaylist = await getVideos(playList.id)
          const idCollapse = `#collapse${index}`
          const idTable = `table-playlist${index}`
          const idTableScroll = `id-tablescroll${index}`
          $(idCollapse).html(`
        <div class="tablescroll" id=${idTableScroll}>
          <table class="table table-striped" id="${idTable}">
            <tbody>
            </tbody>
          </table>
        </div>
          `)

          if (videosInPlaylist.data.data.length < 4) {
            document.getElementById(idTableScroll).style.overflowY = "hidden";
            document.getElementById(idTableScroll).style.height = videosInPlaylist.data.data.length * 120 + "px";
          }
          let dataVideoString = ""
          for (let videoIndex = 0; videoIndex < videosInPlaylist.data.data.length; videoIndex++) {
            const video = videosInPlaylist.data.data[videoIndex];
            const videoId = video.id

            dataVideoString += `<tr onclick="clickVideoDetail('${videoId}')">
                                  <td><img src="${video.thumbnails[0].url}"></td>
                                  <td>${video.title}</td>
                                  <td>${video.publishedAt}</td>
                                </tr>`
          }
          $(`#${idTable} tbody`).append(dataVideoString)

        }
        checkClickPlaylist = 1;
      }
    }

  } catch (error) {
    console.log(error);
  }
}

async function getPlaylist() {
  try {
    const response = await axios.get("http://localhost:3004/api/playlists", {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response
  } catch (error) {
    console.log(error);
    return null
  }
}

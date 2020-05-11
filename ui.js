$(async function() {
  // cache some selectors we'll be using quite a bit
  const $allStoriesList = $("#all-articles-list");
  const $submitForm = $("#submit-form");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");
  const $navMain = $('#nav-main');
  const $createStoryForm = $('#create-new-story');
  const $navSubmit = $('#nav-submit');
  const $navFavorites = $('#nav-favorites');
  const $favoriteArticles = $('#favorited-articles');
  const $navMyStories = $('#nav-my-stories');
  const $myStories = $('#my-articles');
  const $allLists = $('#all-lists');

  // global storyList variable
  let storyList = null;

  // global currentUser variable
  let currentUser = null;

  await checkIfLoggedIn();

  /**
   * Event listener for logging in.
   *  If successful we will setup the user instance
   */

  $loginForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page-refresh on submit

    // grab the username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    // set the global user to the user instance
    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  /**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */

  $createAccountForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page refresh

    // grab the required fields
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();

    // call the create method, which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    currentUser = newUser;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });


  // Event listener to reveal Create New Story section
  $navSubmit.on('click', function(evt) {
    hideElements();
    $createStoryForm.show();
  }); 

  // Event listener to reveal favorites section
  $navFavorites.on('click', function(evt){
    hideElements();
    $favoriteArticles.empty();

    if(currentUser.favorites.length === 0){
      result = $('<p>No favorites added!</p>');
      $favoriteArticles.append(result);
    }
    else {
      for (let story of currentUser.favorites){
        result = generateStoryHTML(story);
        $favoriteArticles.append(result);
      }
    }
    
    $favoriteArticles.show();
  });

  // Event listener to reveal My Stories section
  $navMyStories.on('click', function(evt){
    hideElements();
    $myStories.empty();

    if(currentUser.ownStories.length === 0){
      result = $('<p>No stories added!</p>');
      $myStories.append(result);
    }
    else{
      for (let story of currentUser.ownStories){
        let hostName = getHostName(story.url);
        result = $(
        `<li id='${story.storyId}'><span><i id='delete' class="far fa-trash-alt"></i></span>
        <a class="article-link" href="${story.url}" target="a_blank">
        <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
        </li>`);
        $myStories.append(result);
      }
    }
    
    $myStories.show();
  });

  // Event listener for deleting a story 
  $myStories.on('click', '.fa-trash-alt', async function (evt) {
    if (!currentUser){
      return null;
    }

    //get idToRemove from parent El
    let idToRemove = $(this).closest('li').attr('id');

    // Call deleteStory to handle memory 
    const deletedStory = await storyList.deleteStory(currentUser, idToRemove);

    //update DOM 
    $(this).closest('li').remove();
  })


  // Event listener for creating a new story 
  $createStoryForm.on('submit', async function(evt) {
    evt.preventDefault(); // no page refresh

    // Check if logged in
    if (!currentUser){
      return;
    }

    //grab required fields and create a newStory object
    let title = $('#article-title').val();
    let author = $('#article-author').val();
    let url = $('#article-url').val();
    let storyToAdd = {
      title,
      author,
      url
    };

    // call addStory method on the storyList instance with currentUser and newStory
    const newStory = await storyList.addStory(currentUser, storyToAdd);
    
    //append it to the DOM
    let storyLi = generateStoryHTML(newStory);
    $allStoriesList.prepend(storyLi);

    //show DOM content 
    $createStoryForm.slideUp();
    $createStoryForm.trigger('reset');
    $allStoriesList.show();
  })


  /**
   * Log Out Functionality
   */

  $navLogOut.on("click", function() {
    // empty out local storage
    localStorage.clear();
    // refresh the page, clearing memory
    location.reload();
  });

  /**
   * Event Handler for Clicking Login
   */

  $navLogin.on("click", function() {
    // Show the Login and Create Account Forms
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });

  /**
   * Event handler for Navigation to Homepage
   */

  $("body").on("click", "#nav-all", async function() {
    hideElements();
    await generateStories();
    $allStoriesList.show();
  });

  /**
   * On page load, checks local storage to see if the user is already logged in.
   * Renders page information accordingly.
   */

  async function checkIfLoggedIn() {
    // let's see if we're logged in
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    // if there is a token in localStorage, call User.getLoggedInUser
    //  to get an instance of User with the right details
    //  this is designed to run once, on page load
    currentUser = await User.getLoggedInUser(token, username);
    await generateStories();

    if (currentUser) {
      showNavForLoggedInUser();
    }
  }

  /**
   * A rendering function to run to reset the forms and hide the login info
   */

  function loginAndSubmitForm() {
    // hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    // reset those forms
    $loginForm.trigger("reset");
    $createAccountForm.trigger("reset");

    // show the stories
    $allStoriesList.show();

    // update the navigation bar
    showNavForLoggedInUser();
  }

  /**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance. Then render it.
   */

  async function generateStories() {
    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();
    // update our global variable
    storyList = storyListInstance;
    // empty out that part of the page
    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      const result = generateStoryHTML(story);
      $allStoriesList.append(result);
    }
  }

  /**
   * A function to render HTML for an individual Story instance
   */

  function generateStoryHTML(story) {
    let hostName = getHostName(story.url);
    let star = isFavorite(story) ? "fas fa-star" : "far fa-star";

    // render story markup
    const storyMarkup = $(`
      <li id="${story.storyId}">
        <span>
        <i class="${star}"></i>
        </span>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong>${story.title}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
      </li>
    `);

    return storyMarkup;
  }

  /* 
  * Event handler for favoriting
  */

  $allLists.on('click', '.fa-star', async function(evt) {
    if(!currentUser){
      return null;
    }
    let parentLi = $(this).closest('li');
    let storyId = parentLi.attr('id');
    //check if it's already favorited 
    if ($(this).hasClass('fas')){
      //remove from favorites list 
      await currentUser.removeFavoriteStory(storyId);
      //update the dom 
      $(this).closest('i').toggleClass("fas far");
    } 
    else {
      await currentUser.addFavoriteStory(storyId);
      $(this).closest('i').toggleClass("far fas");
    }
    
  });

  //Helper function for determining if a story is favorite or not 
  
  function isFavorite(story){
    if (currentUser){
      let favoriteStoryIds = new Set(currentUser.favorites.map(obj => obj.storyId));
      return favoriteStoryIds.has(story.storyId);
    }
  }


  /* hide all elements in elementsArr */

  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm,
      $createStoryForm,
      $favoriteArticles,
      $myStories
    ];
    elementsArr.forEach($elem => $elem.hide());
  }

  //show logged in user nav 
  function showNavForLoggedInUser() {
    $navLogin.hide();
    $navMain.show();
    $navLogOut.show();
  }

  /* simple function to pull the hostname from a URL */

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  /* sync current user information to localStorage */

  function syncCurrentUserToLocalStorage() {
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }
});



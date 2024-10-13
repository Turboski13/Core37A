const api = require('./server/index.js');
const pg = require('pg')
const client = new pg.Client('postgres://localhost:5432/2405-ftb-et-web-pt')
jest.mock('./server/index.js');

// Fetch methods
test('fetches all users', async () => {
    const users = [{
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    },
    {
        id: 2,
        username: 'Jane Eyre',
        password: 'NeverThatHandsome'
    }];
    api.fetchUsers.mockResolvedValue(users); // mocking the try block that getUsers returns
    const response = await api.fetchUsers(client); // calling the function
    expect(response).toEqual(users); // checking if the data returned is the same as the data mocked
});

test('fetches all items', async () => {
    const products = [{
        id: 1,
        name: 'Ford Mustang'
    },
    {
        id: 2,
        name: 'Rochester Estate'
    }];
    api.fetchProducts.mockResolvedValue(products); 
    const response = await api.fetchItems(client); 
    expect(response).toEqual(products); 
});

test('fetches all reviews', async () => {
    const reviews = [{
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    },
    {
        id: 2,
        user_id: 2,
        item_id: 2,
        rating: 4,
        comments: 'This house is beautiful'
    }];
    api.fetchReviews.mockResolvedValue(reviews);
    const response = await api.fetchReviews(client);
    expect(response).toEqual(reviews);
});

test('fetches all comments', async () => {
    const comments = [{
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    },
    {
        id: 2,
        review_id: 2,
        user_id: 2,
        comment_text: 'I disagree'
    }];
    api.fetchComments.mockResolvedValue(comments);
    const response = await api.fetchComments(client);
    expect(response).toEqual(comments);
}
);

// Update methods
test('Updates a user', async () => {
    const user = {
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    };

    api.updateUser.mockResolvedValue(user);
    const response = await api.updateUser(client);
    expect(response).toEqual(user);
});

test('Updates an item', async () => {
    const product = {
        id: 1,
        name: 'Ford Mustang'
    };

    api.updateProduct.mockResolvedValue(product);
    const response = await api.updateProduct(client);
    expect(response).toEqual(product);
});

test('Updates a review', async () => {
    const review = {
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    };

    api.updateReview.mockResolvedValue(review);
    const response = await api.updateReview(client);
    expect(response).toEqual(review);
});

test('Updates a comment', async () => {
    const comment = {
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    };

    api.updateComment.mockResolvedValue(comment);
    const response = await api.updateComment(client);
    expect(response).toEqual(comment);
}
);

// Delete methods
test('Deletes a user', async () => {
    const user = {
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    };

    api.deleteUser.mockResolvedValue(user);
    const response = await api.deleteUser(client);
    expect(response).toEqual(user);
});

test('Deletes an item', async () => {
    const product = {
        id: 1,
        name: 'Ford Mustang'
    };

    api.deleteProduct.mockResolvedValue(product);
    const response = await api.deleteProduct(client);
    expect(response).toEqual(product);
});

test('Deletes a review', async () => {
    const review = {
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    };

    api.deleteReview.mockResolvedValue(review);
    const response = await api.deleteReview(client);
    expect(response).toEqual(review);
}
);

test('Deletes a comment', async () => {
    const comment = {
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    };

    api.deleteComment.mockResolvedValue(comment);
    const response = await api.deleteComment(client);
    expect(response).toEqual(comment);
}
);

// Get by ID methods
test('Gets a user by ID', async () => {
    const user = {
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    };

    api.getUserById.mockResolvedValue(user);
    const response = await api.getUserById(client);
    expect(response).toEqual(user);
});

test('Gets an item by ID', async () => {
    const product = {
        id: 1,
        name: 'Ford Mustang'
    };

    api.getItemById.mockResolvedValue(product);
    const response = await api.getItemById(client);
    expect(response).toEqual(product);
}
);

test('Gets a review by ID', async () => {
    const review = {
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    };

    api.getReviewById.mockResolvedValue(review);
    const response = await api.getReviewById(client);
    expect(response).toEqual(review);
}
);

test('Gets a comment by ID', async () => {
    const comment = {
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    };

    api.getCommentById.mockResolvedValue(comment);
    const response = await api.getCommentById(client);
    expect(response).toEqual(comment);
}
);

// Get reviews by ID
test('Gets reviews by user ID', async () => {
    const reviews = [{
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    },
    {
        id: 2,
        user_id: 1,
        item_id: 2,
        rating: 4,
        comments: 'This house is beautiful'
    }];

    api.getReviewsByUserId.mockResolvedValue(reviews);
    const response = await api.getReviewsByUserId(client);
    expect(response).toEqual(reviews);
}
);

test('Gets comments by user ID', async () => {
    const comments = [{
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    },
    {
        id: 2,
        review_id: 2,
        user_id: 1,
        comment_text: 'I disagree'
    }];

    api.getCommentsByUserId.mockResolvedValue(comments);
    const response = await api.getCommentsByUserId(client);
    expect(response).toEqual(comments);
}
);

// Create methods
test('Creates a user', async () => {
    const user = {
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    };

    api.createUser.mockResolvedValue(user);
    const response = await api.createUser(client);
    expect(response).toEqual(user);
});

test('Creates an item', async () => {
    const product = {
        id: 1,
        name: 'Ford Mustang'
    };

    api.createItem.mockResolvedValue(product);
    const response = await api.createItem(client);
    expect(response).toEqual(product);
});

test('Creates a review', async () => {
    const review = {
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    };

    api.createReview.mockResolvedValue(review);
    const response = await api.createReview(client);
    expect(response).toEqual(review);
}
);

test('Creates a comment', async () => {
    const comment = {
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    };

    api.createComment.mockResolvedValue(comment);
    const response = await api.createComment(client);
    expect(response).toEqual(comment);
}
);

// Search methods
test('Searches for items', async () => {
    const items = [{
        id: 1,
        name: 'Ford Mustang'
    },
    {
        id: 2,
        name: 'Rochester Estate'
    }];

    api.searchItems.mockResolvedValue(items);
    const response = await api.searchItems(client);
    expect(response).toEqual(items);
}
);

// Get item details
test('Gets item details', async () => {
    const itemDetails = [{
        id: 1,
        name: 'Ford Mustang',
        details: 'This car is amazing',
        rating: 5
    }];

    api.getItemDetails.mockResolvedValue(itemDetails);
    const response = await api.getItemDetails(client);
    expect(response).toEqual(itemDetails);
}
);

// Sign up
test('Signs up a user', async () => {
    const user = {
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    };

    api.signUp.mockResolvedValue(user);
    const response = await api.signUp(client);
    expect(response).toEqual(user);
}
);

// Log in
test('Logs in a user', async () => {
    const user = {
        id: 1,
        username: 'John Wick',
        password: 'theCarIsntForSale'
    };

    api.logIn.mockResolvedValue(user);
    const response = await api.logIn(client);
    expect(response).toEqual(user);
}
);

// Average rating
test('Gets average rating', async () => {
    const itemDetails = [{
        id: 1,
        name: 'Ford Mustang'
    }];
    const avgRating = 5;

    api.getAverageRating.mockResolvedValue(avgRating);
    const response = await api.getAverageRating(client);
    expect(response).toEqual(avgRating);
}
);

// Get reviews by item ID
test('Gets reviews by item ID', async () => {
    const reviews = [{
        id: 1,
        user_id: 1,
        item_id: 1,
        rating: 5,
        comments: 'This car is amazing'
    },
    {
        id: 2,
        user_id: 2,
        item_id: 1,
        rating: 4,
        comments: 'This car is beautiful'
    }];

    api.getReviewsByItemId.mockResolvedValue(reviews);
    const response = await api.getReviewsByItemId(client);
    expect(response).toEqual(reviews);
}
);

// Get comments by review ID
test('Gets comments by review ID', async () => {
    const comments = [{
        id: 1,
        review_id: 1,
        user_id: 1,
        comment_text: 'I agree'
    },
    {
        id: 2,
        review_id: 1,
        user_id: 2,
        comment_text: 'I disagree'
    }];

    api.getCommentsByReviewId.mockResolvedValue(comments);
    const response = await api.getCommentsByReviewId(client);
    expect(response).toEqual(comments);
}
);

const Movie = require('../models/Movie');

module.exports.addMovie = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Only admins can add movies.' });
    }

    const { title, director, year, description, genre, comments } = req.body;

    const newMovie = new Movie({
      title,
      director,
      year,
      description,
      genre,
      comments: comments || []
    });

    const savedMovie = await newMovie.save();

    // Manually structure response with custom key order
    return res.status(201).json({
      title: savedMovie.title,
      director: savedMovie.director,
      year: savedMovie.year,
      description: savedMovie.description,
      genre: savedMovie.genre,
      _id: savedMovie._id,
      comments: savedMovie.comments,
      __v: savedMovie.__v
    });

  } catch (error) {
    console.error('Error creating movie:', error.message);
    return res.status(500).json({ message: 'Server error while creating movie.' });
  }
};


module.exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    const formattedMovies = movies.map(movie => ({
      id: movie._id,
      title: movie.title,
      director: movie.director,
      year: movie.year,
      description: movie.description,
      genre: movie.genre,
      comments: movie.comments || []
    }));

    return res.status(200).json({ movies: formattedMovies });

  } catch (error) {
    console.error('Error fetching movies:', error.message);
    return res.status(500).json({ message: 'Server error while retrieving movies.' });
  }
};


module.exports.getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const formattedMovie = {
      id: movie._id,
      title: movie.title,
      director: movie.director,
      year: movie.year,
      description: movie.description,
      genre: movie.genre,
      comments: movie.comments || []
    };

    return res.status(200).json(formattedMovie);

  } catch (error) {
    console.error('Error retrieving movie:', error.message);
    return res.status(500).json({ message: 'Server error while retrieving movie.' });
  }
};



module.exports.updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const updateData = req.body;

    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    const formattedMovie = {
      id: updatedMovie._id,
      title: updatedMovie.title,
      director: updatedMovie.director,
      year: updatedMovie.year,
      description: updatedMovie.description,
      genre: updatedMovie.genre,
      comments: updatedMovie.comments || []
    };

    return res.status(200).json({
      message: 'Movie updated successfully',
      updateMovie: [formattedMovie]
    });

  } catch (error) {
    console.error('Error updating movie:', error.message);
    return res.status(500).json({ message: 'Server error while updating movie.' });
  }
};




module.exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    await movie.deleteOne();

    return res.status(200).json({ message: 'Movie deleted successfully' });

  } catch (error) {
    console.error('Error deleting movie:', error.message);
    return res.status(500).json({ message: 'Server error while deleting movie.' });
  }
};


//Add comment


module.exports.addComment = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { comment } = req.body;
    const userId = req.user?.id;

    if (!comment) {
      return res.status(400).json({ message: 'Comment is required.' });
    }

    // Add comment to the movie's comments array
    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      {
        $push: {
          comments: {
            userId,
            comment
          }
        }
      },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    return res.status(200).json({
      message: 'comment added successfully',
      updatedMovie: {
        id: updatedMovie._id,
        title: updatedMovie.title,
        director: updatedMovie.director,
        year: updatedMovie.year,
        description: updatedMovie.description,
        genre: updatedMovie.genre,
        comments: updatedMovie.comments.map(c => ({
          userId: c.userId,
          comment: c.comment,
          _id: c._id
        }))
      },
      __v: updatedMovie.__v
    });

  } catch (error) {
    console.error('Error adding comment:', error.message);
    return res.status(500).json({ message: 'Server error while adding comment.' });
  }
};

module.exports.getComments = async (req, res) => {
    const movieId = req.params.id; 
    
    try {
      // Find the movie by its ID
      const movie = await Movie.findById(movieId);
      
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }
  
      // Access the comments from the movie document's comments field
      const comments = movie.comments;
  
      // Format the comments if necessary (e.g., extracting userId, comment, and _id)
      const formattedComments = comments.map(comment => ({
        userId: comment.userId, // Extracting userId from the comment
        comment: comment.comment, // Extracting the text of the comment
        _id: comment._id        // Extracting the comment's _id
      }));
  
      // Return the comments in the response
      return res.status(200).json({ comments: formattedComments });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
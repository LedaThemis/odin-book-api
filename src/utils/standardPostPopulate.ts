const standardPostPopulate = [
    'author',
    {
        path: 'comments',
        populate: {
            path: 'author',
        },
    },
];

export default standardPostPopulate;

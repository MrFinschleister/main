function getMat4Projection(fieldOfView, aspect, zNear, zFar) {
    return Matrix.projection3D(fieldOfView, aspect, zNear, zFar);
}

function getMat4ModelView(rotationsArray, translationsArray) {
    return Matrix.affineTransformation3D(rotationsArray, translationsArray);
}
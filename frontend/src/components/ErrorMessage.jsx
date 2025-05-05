import React from 'react';

function ErrorMessage({ message }) {
    return (
        <div className="bg-red-500 text-white p-4 rounded-xl mb-4 w-1/2 mx-auto text-center">
            <p>❌ {message}</p>
        </div>
    );
}

export default ErrorMessage;
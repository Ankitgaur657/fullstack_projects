class ApiError extends Error{
    constructer(statusCode,
        message="Internal Server Error",
         errors =[],
        stack ="")
        {
            super(message);
            this.statusCode=statusCode;
            this.error=error;
            this.stack=stack;
            this.data=null;
            this.message=message;
            this.success=false;
            this.errors=errors;

            if(stack){
                this.stack=stack;
            }else{
                Error.captureStackTrace(this,this.constructer);
            }
    }
}

export {ApiError};
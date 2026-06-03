package com.markitdownmodule;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.chaquo.python.PyObject;
import com.chaquo.python.Python;

public class MarkItDownModule extends ReactContextBaseJavaModule {

    public MarkItDownModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "MarkItDownModule";
    }

    @ReactMethod
    public void convert(String filePath, Promise promise) {
        try {
            Python py = Python.getInstance();
            PyObject converterModule = py.getModule("converter");
            PyObject result = converterModule.callAttr("convert_to_markdown", filePath);
            promise.resolve(result.toString());
        } catch (Exception e) {
            promise.reject("CONVERSION_ERROR", e.getMessage(), e);
        }
    }
}

"""
jupyterlab_autosave_on_focus_change setup
"""
import json
from pathlib import Path

from jupyter_packaging import wrap_installers, npm_builder, get_data_files
import setuptools

HERE = Path(__file__).parent.resolve()

# The name of the project
name = "jupyterlab_autosave_on_focus_change"

lab_path = HERE / name / "labextension"

# Representative files that should exist after a successful build
ensured_targets = [str(lab_path / "package.json")]

labext_name = "jupyterlab_autosave_on_focus_change"

data_files_spec = [
    ("share/jupyter/labextensions/%s" % labext_name, str(lab_path), "**"),
    ("share/jupyter/labextensions/%s" % labext_name, str(HERE), "install.json"),
]

post_develop = npm_builder(
    build_cmd="install:extension", source_dir="src", build_dir=lab_path
)
cmdclass = wrap_installers(post_develop=post_develop, ensured_targets=ensured_targets)

long_description = (HERE / "README.md").read_text()

# Get the package info from package.json
pkg_json = json.loads((HERE / "package.json").read_bytes())

setup_args = dict(
    name=name,
    version=pkg_json["version"],
    url=pkg_json["homepage"],
    author=pkg_json["author"]["name"],
    author_email=pkg_json["author"]["email"],
    description=pkg_json["description"],
    license=pkg_json["license"],
    long_description=long_description,
    long_description_content_type="text/markdown",
    cmdclass=cmdclass,
    data_files=get_data_files(data_files_spec),
    packages=setuptools.find_packages(),
    install_requires=["jupyterlab~=3.1", "jupyter_packaging~=0.9,<2"],
    zip_safe=False,
    include_package_data=True,
    python_requires=">=3.7",
    platforms="Linux, Mac OS X, Windows",
    project_urls={
        "Documentation": "https://s-weigand.github.io/jupyterlab_autosave_on_focus_change/",
        "Source": "https://github.com/s-weigand/jupyterlab_autosave_on_focus_change",
        "Tracker": "https://github.com/s-weigand/jupyterlab_autosave_on_focus_change/issues",
        "Changelog": "https://github.com/s-weigand/jupyterlab_autosave_on_focus_change/blob/main/CHANGELOG.md",
    },
    keywords=[
        "Jupyter",
        "JupyterLab",
        "JupyterLab3",
        "autosave",
        "focus",
        "change",
        "extension",
    ],
    classifiers=[
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Framework :: Jupyter",
        "Framework :: Jupyter :: JupyterLab",
        "Framework :: Jupyter :: JupyterLab :: 3",
        "Framework :: Jupyter :: JupyterLab :: Extensions",
        "Framework :: Jupyter :: JupyterLab :: Extensions :: Prebuilt",
    ],
)


if __name__ == "__main__":
    setuptools.setup(**setup_args)
